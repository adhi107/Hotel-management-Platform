import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.schemas.inventory import (
    IngredientCreate,
    IngredientUpdate,
    StockAdjustmentRequest,
    WastageCreateRequest,
    BulkStockInRequest,
)
from app.core.exceptions import NotFoundException, BadRequestException
from app.websocket.manager import ws_manager
import logging

logger = logging.getLogger("aura.inventory")

class InventoryService:
    def __init__(self):
        self.ingredients_col = get_collection("ingredients")
        self.transactions_col = get_collection("inventory_transactions")
        self.wastage_col = get_collection("wastage")
        self.alerts_col = get_collection("alerts")
        self.recipes_col = get_collection("recipes")
        self.products_col = get_collection("products")

    def _enrich_ingredient(self, ing: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates derived health metrics for real-time UI display."""
        current = float(ing.get("current_stock", 0.0))
        minimum = float(ing.get("minimum_stock", 10.0))
        maximum = float(ing.get("maximum_stock", 100.0) or 100.0)
        unit_cost = float(ing.get("unit_cost", 0.0))

        percentage = round((current / maximum * 100.0), 1) if maximum > 0 else 0.0
        percentage = min(100.0, max(0.0, percentage))

        if current <= 0:
            stock_status = "out_of_stock"
        elif current <= minimum:
            stock_status = "critical"
        elif current <= minimum * 1.5:
            stock_status = "low"
        elif current >= maximum * 0.9:
            stock_status = "optimal"
        else:
            stock_status = "good"

        total_value = round(current * unit_cost, 2)
        # Approximate run-out days estimation (based on average depletion heuristic)
        daily_burn_est = max(0.5, minimum / 3.0)
        days_left_est = round(current / daily_burn_est, 1) if current > 0 else 0.0

        ing["stock_status"] = stock_status
        ing["stock_percentage"] = percentage
        ing["stock_value"] = total_value
        ing["is_low_stock"] = current <= minimum
        ing["days_left_est"] = days_left_est
        return ing

    async def _broadcast_inventory_event(self, event_type: str, data: Any):
        """Broadcasts real-time WebSocket update to both branch and tenant channels."""
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        payload = {
            "event": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:inventory", payload)
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:pos", payload)
        if tenant_id:
            await ws_manager.broadcast_to_channel(f"tenant:{tenant_id}:inventory", payload)

    async def list_ingredients(
        self,
        low_stock_only: bool = False,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        query: Dict[str, Any] = {"tenant_id": tenant_id, "is_deleted": {"$ne": True}}
        
        if category and category.lower() != "all":
            query["category"] = {"$regex": f"^{category}$", "$options": "i"}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
                {"storage_location": {"$regex": search, "$options": "i"}}
            ]

        cursor = self.ingredients_col.find(query).sort("name", 1)
        items = await cursor.to_list(500)
        
        enriched = [self._enrich_ingredient(i) for i in items]
        if low_stock_only:
            return [i for i in enriched if i["is_low_stock"]]
        return enriched

    async def get_ingredient(self, ingredient_id: str) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        ing = await self.ingredients_col.find_one({"id": ingredient_id, "tenant_id": tenant_id, "is_deleted": {"$ne": True}})
        if not ing:
            raise NotFoundException("Ingredient", ingredient_id)
        return self._enrich_ingredient(ing)

    async def create_ingredient(self, req: IngredientCreate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        ing_id = str(uuid.uuid4())

        doc = {
            "_id": ing_id,
            "id": ing_id,
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "name": req.name,
            "code": req.code.upper(),
            "category": req.category,
            "unit": req.unit,
            "current_stock": float(req.current_stock),
            "minimum_stock": float(req.minimum_stock),
            "maximum_stock": float(req.maximum_stock),
            "unit_cost": float(req.unit_cost),
            "storage_location": req.storage_location or "Main Pantry",
            "is_perishable": req.is_perishable,
            "expiry_days": req.expiry_days,
            "preferred_vendor_id": req.preferred_vendor_id,
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.ingredients_col.insert_one(doc)

        if req.current_stock > 0:
            await self._record_transaction(
                ingredient_id=ing_id,
                ingredient_name=req.name,
                transaction_type="stock_in",
                quantity=req.current_stock,
                unit=req.unit,
                unit_cost=req.unit_cost,
                notes="Initial Opening Stock"
            )

        enriched = self._enrich_ingredient(doc)
        await self._broadcast_inventory_event("INGREDIENT_CREATED", enriched)
        return enriched

    async def update_ingredient(self, ingredient_id: str, req: IngredientUpdate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        ing = await self.ingredients_col.find_one({"id": ingredient_id, "tenant_id": tenant_id})
        if not ing:
            raise NotFoundException("Ingredient", ingredient_id)

        update_dict: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
        for k, v in req.model_dump(exclude_unset=True).items():
            if v is not None:
                update_dict[k] = v

        if "code" in update_dict:
            update_dict["code"] = update_dict["code"].upper()

        await self.ingredients_col.update_one({"id": ingredient_id}, {"$set": update_dict})
        updated = await self.ingredients_col.find_one({"id": ingredient_id})
        enriched = self._enrich_ingredient(updated)
        await self._broadcast_inventory_event("INGREDIENT_UPDATED", enriched)
        return enriched

    async def delete_ingredient(self, ingredient_id: str) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        ing = await self.ingredients_col.find_one({"id": ingredient_id, "tenant_id": tenant_id})
        if not ing:
            raise NotFoundException("Ingredient", ingredient_id)

        await self.ingredients_col.update_one(
            {"id": ingredient_id},
            {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        await self._broadcast_inventory_event("INGREDIENT_DELETED", {"id": ingredient_id})
        return {"status": "success", "message": "Ingredient archived successfully"}

    async def adjust_stock(self, req: StockAdjustmentRequest) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        ing = await self.ingredients_col.find_one({"id": req.ingredient_id, "tenant_id": tenant_id})
        if not ing:
            raise NotFoundException("Ingredient", req.ingredient_id)

        current_qty = float(ing.get("current_stock", 0.0))
        if req.transaction_type == "stock_in":
            delta = req.quantity
            new_stock = current_qty + delta
        elif req.transaction_type == "stock_out":
            delta = -req.quantity
            new_stock = max(0.0, current_qty - req.quantity)
        elif req.transaction_type == "adjustment":
            # Direct physical count adjustment
            delta = req.quantity - current_qty
            new_stock = max(0.0, req.quantity)
        else:
            delta = req.quantity
            new_stock = current_qty + delta

        unit_cost = req.unit_cost if req.unit_cost is not None else float(ing.get("unit_cost", 0.0))

        await self.ingredients_col.update_one(
            {"id": req.ingredient_id},
            {"$set": {"current_stock": new_stock, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        await self._record_transaction(
            ingredient_id=req.ingredient_id,
            ingredient_name=ing["name"],
            transaction_type=req.transaction_type,
            quantity=abs(delta),
            unit=ing["unit"],
            unit_cost=unit_cost,
            notes=req.notes or f"Manual stock {req.transaction_type.replace('_', ' ')}"
        )

        updated = await self.ingredients_col.find_one({"id": req.ingredient_id})
        enriched = self._enrich_ingredient(updated)

        # Check low stock alert
        if new_stock <= float(ing.get("minimum_stock", 10.0)):
            await self._trigger_low_stock_alert(ing, new_stock)

        await self._broadcast_inventory_event("STOCK_ADJUSTED", enriched)
        return enriched

    async def record_wastage(self, req: WastageCreateRequest) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        user = TenantContext.get_current_user()

        ing = await self.ingredients_col.find_one({"id": req.ingredient_id, "tenant_id": tenant_id})
        if not ing:
            raise NotFoundException("Ingredient", req.ingredient_id)

        unit_cost = float(ing.get("unit_cost", 0.0))
        cost_amount = round(req.quantity * unit_cost, 2)
        waste_id = str(uuid.uuid4())

        waste_doc = {
            "_id": waste_id,
            "id": waste_id,
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "ingredient_id": req.ingredient_id,
            "ingredient_name": ing["name"],
            "quantity": req.quantity,
            "unit": ing["unit"],
            "unit_cost": unit_cost,
            "cost_amount": cost_amount,
            "reason": req.reason,
            "recorded_by": user.get("full_name") if user else "Kitchen Staff",
            "notes": req.notes,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.wastage_col.insert_one(waste_doc)

        # Reduce stock
        current_qty = float(ing.get("current_stock", 0.0))
        new_stock = max(0.0, current_qty - req.quantity)
        await self.ingredients_col.update_one(
            {"id": req.ingredient_id},
            {"$set": {"current_stock": new_stock, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        await self._record_transaction(
            ingredient_id=req.ingredient_id,
            ingredient_name=ing["name"],
            transaction_type="wastage",
            quantity=req.quantity,
            unit=ing["unit"],
            unit_cost=unit_cost,
            notes=f"Wastage: {req.reason} ({req.notes or 'Kitchen reported'})"
        )

        updated = await self.ingredients_col.find_one({"id": req.ingredient_id})
        enriched = self._enrich_ingredient(updated)

        if new_stock <= float(ing.get("minimum_stock", 10.0)):
            await self._trigger_low_stock_alert(ing, new_stock)

        await self._broadcast_inventory_event("WASTAGE_LOGGED", {
            "wastage": waste_doc,
            "updated_ingredient": enriched
        })
        return waste_doc

    async def bulk_stock_in(self, req: BulkStockInRequest) -> Dict[str, Any]:
        """Applies multiple stock replenishments in a single batch transaction."""
        tenant_id = TenantContext.get_tenant_id()
        updated_items = []

        for item in req.items:
            ing = await self.ingredients_col.find_one({"id": item.ingredient_id, "tenant_id": tenant_id})
            if not ing:
                continue

            current_qty = float(ing.get("current_stock", 0.0))
            new_stock = current_qty + item.quantity
            unit_cost = item.unit_cost if item.unit_cost is not None else float(ing.get("unit_cost", 0.0))

            await self.ingredients_col.update_one(
                {"id": item.ingredient_id},
                {"$set": {"current_stock": new_stock, "unit_cost": unit_cost, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )

            await self._record_transaction(
                ingredient_id=item.ingredient_id,
                ingredient_name=ing["name"],
                transaction_type="stock_in",
                quantity=item.quantity,
                unit=ing["unit"],
                unit_cost=unit_cost,
                reference_id=req.invoice_number,
                notes=f"Bulk Replenishment {req.invoice_number or ''} {req.notes or ''}".strip()
            )

            updated = await self.ingredients_col.find_one({"id": item.ingredient_id})
            updated_items.append(self._enrich_ingredient(updated))

        await self._broadcast_inventory_event("INVENTORY_BULK_UPDATED", updated_items)
        return {"status": "success", "updated_count": len(updated_items), "items": updated_items}

    async def deduct_order_inventory(self, order_doc: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Automatically performs recipe-based inventory deductions when an order is placed/completed.
        Subtracts raw materials in real-time and broadcasts live updates across POS and Inventory.
        """
        tenant_id = order_doc.get("tenant_id")
        if not tenant_id:
            return []

        deducted_ingredients = []
        items = order_doc.get("items", [])

        for item in items:
            prod_id = item.get("product_id")
            prod_name = item.get("product_name")
            qty = float(item.get("quantity", 1.0))

            # Find matching recipe
            recipe = None
            if prod_id:
                recipe = await self.recipes_col.find_one({"product_id": prod_id, "tenant_id": tenant_id, "is_deleted": {"$ne": True}})
            if not recipe and prod_name:
                recipe = await self.recipes_col.find_one({"product_name": prod_name, "tenant_id": tenant_id, "is_deleted": {"$ne": True}})

            if not recipe:
                continue

            yield_servings = float(recipe.get("yield_servings", 1.0) or 1.0)
            portion_multiplier = qty / yield_servings

            for r_ing in recipe.get("ingredients", []):
                ing_id = r_ing.get("ingredient_id")
                req_qty = float(r_ing.get("quantity", 0.0)) * portion_multiplier
                if req_qty <= 0:
                    continue

                ing = None
                if ing_id:
                    ing = await self.ingredients_col.find_one({"id": ing_id, "tenant_id": tenant_id})
                if not ing and r_ing.get("ingredient_name"):
                    ing = await self.ingredients_col.find_one({"name": r_ing.get("ingredient_name"), "tenant_id": tenant_id})

                if not ing:
                    continue

                current_stock = float(ing.get("current_stock", 0.0))
                new_stock = max(0.0, current_stock - req_qty)

                await self.ingredients_col.update_one(
                    {"id": ing["id"]},
                    {"$set": {"current_stock": new_stock, "updated_at": datetime.now(timezone.utc).isoformat()}}
                )

                unit_cost = float(r_ing.get("unit_cost", ing.get("unit_cost", 0.0)))
                await self._record_transaction(
                    ingredient_id=ing["id"],
                    ingredient_name=ing["name"],
                    transaction_type="recipe_deduction",
                    quantity=req_qty,
                    unit=ing["unit"],
                    unit_cost=unit_cost,
                    reference_id=order_doc.get("order_number") or order_doc.get("id"),
                    notes=f"Recipe Auto-Deduction: {qty}x {prod_name}"
                )

                updated = await self.ingredients_col.find_one({"id": ing["id"]})
                enriched = self._enrich_ingredient(updated)
                deducted_ingredients.append(enriched)

                if new_stock <= float(ing.get("minimum_stock", 10.0)):
                    await self._trigger_low_stock_alert(ing, new_stock)

        if deducted_ingredients:
            await self._broadcast_inventory_event("INVENTORY_RECIPE_DEDUCTED", {
                "order_number": order_doc.get("order_number"),
                "order_id": order_doc.get("id"),
                "deducted_items": deducted_ingredients
            })

        return deducted_ingredients

    async def get_transactions(
        self,
        ingredient_id: Optional[str] = None,
        transaction_type: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        query: Dict[str, Any] = {"tenant_id": tenant_id}
        if ingredient_id:
            query["ingredient_id"] = ingredient_id
        if transaction_type and transaction_type.lower() != "all":
            query["transaction_type"] = transaction_type.lower()

        cursor = self.transactions_col.find(query).sort("created_at", -1)
        return await cursor.to_list(limit)

    async def get_analytics(self) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        items = await self.ingredients_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}}).to_list(500)
        enriched = [self._enrich_ingredient(i) for i in items]

        total_skus = len(enriched)
        total_value = sum(i["stock_value"] for i in enriched)
        out_of_stock = [i for i in enriched if i["stock_status"] == "out_of_stock"]
        critical_low = [i for i in enriched if i["stock_status"] in ["critical", "low"]]
        healthy = [i for i in enriched if i["stock_status"] in ["good", "optimal"]]

        # Today's movements
        today_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        tx_cursor = self.transactions_col.find({
            "tenant_id": tenant_id,
            "created_at": {"$regex": f"^{today_iso}"}
        })
        todays_txs = await tx_cursor.to_list(1000)

        today_deductions_qty = sum(t.get("quantity", 0.0) for t in todays_txs if t.get("transaction_type") == "recipe_deduction")
        today_stock_in_cost = sum(t.get("total_cost", 0.0) for t in todays_txs if t.get("transaction_type") == "stock_in")

        waste_cursor = self.wastage_col.find({
            "tenant_id": tenant_id,
            "created_at": {"$regex": f"^{today_iso}"}
        })
        todays_waste = await waste_cursor.to_list(500)
        today_waste_cost = sum(w.get("cost_amount", 0.0) for w in todays_waste)

        return {
            "total_skus": total_skus,
            "total_stock_value": round(total_value, 2),
            "out_of_stock_count": len(out_of_stock),
            "low_stock_count": len(critical_low),
            "healthy_stock_count": len(healthy),
            "today_deductions_qty": round(today_deductions_qty, 2),
            "today_stock_in_cost": round(today_stock_in_cost, 2),
            "today_waste_cost": round(today_waste_cost, 2),
            "critical_items": critical_low[:5]
        }

    async def get_reorder_suggestions(self) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        items = await self.ingredients_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}}).to_list(500)
        enriched = [self._enrich_ingredient(i) for i in items]

        suggestions = []
        for ing in enriched:
            curr = ing["current_stock"]
            min_stk = ing["minimum_stock"]
            max_stk = ing["maximum_stock"]
            unit_cost = ing["unit_cost"]

            if curr <= min_stk:
                suggested_qty = max(10.0, max_stk - curr)
                est_cost = round(suggested_qty * unit_cost, 2)
                urgency = "HIGH (Immediate Reorder)" if curr == 0 else "MEDIUM (Approaching Out of Stock)"
                suggestions.append({
                    "ingredient_id": ing["id"],
                    "ingredient_name": ing["name"],
                    "code": ing["code"],
                    "category": ing["category"],
                    "unit": ing["unit"],
                    "current_stock": curr,
                    "minimum_stock": min_stk,
                    "maximum_stock": max_stk,
                    "suggested_order_quantity": suggested_qty,
                    "unit_cost": unit_cost,
                    "estimated_total_cost": est_cost,
                    "urgency": urgency,
                    "storage_location": ing.get("storage_location", "Main Store")
                })
        return suggestions

    async def _record_transaction(
        self,
        ingredient_id: str,
        ingredient_name: str,
        transaction_type: str,
        quantity: float,
        unit: str,
        unit_cost: float,
        reference_id: Optional[str] = None,
        notes: Optional[str] = None
    ):
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        total_cost = round(quantity * unit_cost, 2)
        tx_doc = {
            "_id": str(uuid.uuid4()),
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "ingredient_id": ingredient_id,
            "ingredient_name": ingredient_name,
            "transaction_type": transaction_type,
            "quantity": quantity,
            "unit": unit,
            "unit_cost": unit_cost,
            "total_cost": total_cost,
            "reference_id": reference_id,
            "notes": notes,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await self.transactions_col.insert_one(tx_doc)

    async def _trigger_low_stock_alert(self, ingredient: Dict[str, Any], current_qty: float):
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        alert_doc = {
            "_id": str(uuid.uuid4()),
            "id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "alert_type": "low_inventory",
            "severity": "critical" if current_qty == 0 else "warning",
            "title": f"Low Stock: {ingredient['name']}",
            "message": f"{ingredient['name']} is at {current_qty} {ingredient['unit']} (Safety Minimum: {ingredient['minimum_stock']})",
            "data": {"ingredient_id": ingredient["id"], "current_stock": current_qty, "minimum_stock": ingredient["minimum_stock"]},
            "is_resolved": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await self.alerts_col.insert_one(alert_doc)
        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:alerts", {
                "event": "NEW_ALERT",
                "data": alert_doc
            })
