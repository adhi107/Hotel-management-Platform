import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.core.exceptions import NotFoundException, BadRequestException
from app.schemas.pos import QuickSaleRequest, CreateOrderRequest, ProcessPaymentRequest
from app.websocket.manager import ws_manager
from app.services.inventory_service import InventoryService
import logging

logger = logging.getLogger("aura.pos")

class PosService:
    def __init__(self):
        self.orders_col = get_collection("orders")
        self.tables_col = get_collection("tables")
        self.products_col = get_collection("products")
        self.tenants_col = get_collection("tenants")
        self.ingredients_col = get_collection("ingredients")
        self.recipes_col = get_collection("recipes")
        self.khata_col = get_collection("customer_khata")
        self.customers_col = get_collection("customers")

    async def quick_sale(self, req: QuickSaleRequest) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        user = TenantContext.get_current_user()

        order_id = str(uuid.uuid4())
        short_num = f"QS-{datetime.now().strftime('%H%M%S')}"

        subtotal = 0.0
        items_doc = []
        for itm in req.items:
            t_price = itm.unit_price * itm.quantity
            subtotal += t_price
            items_doc.append({
                "id": str(uuid.uuid4()),
                "product_id": itm.product_id or str(uuid.uuid4()),
                "product_name": itm.product_name,
                "unit_price": itm.unit_price,
                "quantity": itm.quantity,
                "total_price": t_price,
                "status": "completed"
            })

        # Calculate tax from tenant settings
        tenant = await self.tenants_col.find_one({"id": tenant_id})
        tax_pct = tenant.get("config", {}).get("tax_percent", 0.0) if tenant else 0.0
        tax_amount = round((subtotal * tax_pct) / 100.0, 2)
        grand_total = max(0.0, round(subtotal + tax_amount - req.discount_amount, 2))

        payment_entry = {
            "method": req.payment_method,
            "amount": grand_total,
            "transaction_ref": f"TXN-{order_id[:8].upper()}",
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        order_doc = {
            "_id": order_id,
            "id": order_id,
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "order_number": short_num,
            "order_type": "quick_sale",
            "customer_id": req.customer_id,
            "customer_name": req.customer_name or "Walk-in Customer",
            "customer_phone": req.customer_phone,
            "server_id": user.get("id") if user else None,
            "server_name": user.get("role") if user else "Cashier",
            "items": items_doc,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "discount_amount": req.discount_amount,
            "grand_total": grand_total,
            "status": "completed",
            "payment_status": "paid",
            "payments": [payment_entry],
            "notes": req.notes,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        await self.orders_col.insert_one(order_doc)

        # If payment is Khata / Credit, record in Customer Khata
        if req.payment_method == "khata" and req.customer_phone:
            khata_rec = await self.khata_col.find_one({"tenant_id": tenant_id, "customer_phone": req.customer_phone})
            khata_entry = {
                "id": str(uuid.uuid4()),
                "entry_type": "credit",
                "amount": grand_total,
                "order_id": order_id,
                "description": f"Quick Sale Order #{short_num}",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            if khata_rec:
                new_bal = khata_rec.get("current_balance", 0.0) + grand_total
                new_cred = khata_rec.get("total_credit", 0.0) + grand_total
                entries = khata_rec.get("entries", [])
                entries.append(khata_entry)
                await self.khata_col.update_one(
                    {"id": khata_rec["id"]},
                    {"$set": {"current_balance": new_bal, "total_credit": new_cred, "entries": entries}}
                )
            else:
                new_khata = {
                    "_id": str(uuid.uuid4()),
                    "id": str(uuid.uuid4()),
                    "tenant_id": tenant_id,
                    "branch_id": branch_id,
                    "customer_id": req.customer_id or str(uuid.uuid4()),
                    "customer_name": req.customer_name or "Credit Customer",
                    "customer_phone": req.customer_phone,
                    "credit_limit": 5000.0,
                    "total_credit": grand_total,
                    "total_paid": 0.0,
                    "current_balance": grand_total,
                    "status": "active",
                    "entries": [khata_entry],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await self.khata_col.insert_one(new_khata)

        # Automatically deduct recipe inventory in real-time
        try:
            await InventoryService().deduct_order_inventory(order_doc)
        except Exception as e:
            logger.warning(f"Automatic inventory deduction failed for quick sale {order_id}: {e}")

        # Broadcast order to real-time websocket
        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:pos", {
                "event": "NEW_ORDER",
                "data": order_doc
            })

        return order_doc

    async def create_order(self, req: CreateOrderRequest) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        user = TenantContext.get_current_user()

        order_id = str(uuid.uuid4())
        short_num = f"ORD-{datetime.now().strftime('%H%M%S')}"

        # Fetch table details if table_id is given
        table_number = req.table_number
        if req.table_id:
            tbl = await self.tables_col.find_one({"id": req.table_id})
            if tbl:
                table_number = tbl.get("table_number") or req.table_number
                # Update table status to occupied
                await self.tables_col.update_one(
                    {"id": req.table_id},
                    {"$set": {"status": "occupied", "current_order_id": order_id}}
                )
                if branch_id:
                    await ws_manager.broadcast_to_channel(f"branch:{branch_id}:tables", {
                        "event": "TABLE_UPDATED",
                        "data": {"id": req.table_id, "status": "occupied", "table_number": table_number}
                    })

        subtotal = 0.0
        items_doc = []
        for itm in req.items:
            item_dict = itm.model_dump()
            if not item_dict.get("id"):
                item_dict["id"] = str(uuid.uuid4())
            if not item_dict.get("product_id"):
                item_dict["product_id"] = str(uuid.uuid4())
            calc_total = item_dict.get("total_price") or (item_dict.get("unit_price", 0.0) * item_dict.get("quantity", 1))
            item_dict["total_price"] = calc_total
            subtotal += calc_total
            items_doc.append(item_dict)

        tenant = await self.tenants_col.find_one({"id": tenant_id})
        tax_pct = tenant.get("config", {}).get("tax_percent", 5.0) if tenant else 5.0
        tax_amount = round((subtotal * tax_pct) / 100.0, 2)
        grand_total = max(0.0, round(subtotal + tax_amount - req.discount_amount, 2))

        # Check if payments were supplied with creation
        payment_entries = []
        for p in req.payments:
            p_dict = p.model_dump()
            p_dict["created_at"] = datetime.now(timezone.utc).isoformat()
            if not p_dict.get("transaction_ref"):
                p_dict["transaction_ref"] = f"TXN-{order_id[:6].upper()}"
            payment_entries.append(p_dict)

        total_paid = sum(p.get("amount", 0.0) for p in payment_entries)
        is_paid = len(payment_entries) > 0 and total_paid >= grand_total

        order_doc = {
            "_id": order_id,
            "id": order_id,
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "order_number": short_num,
            "order_type": req.order_type,
            "table_id": req.table_id,
            "table_number": table_number,
            "customer_id": req.customer_id,
            "customer_name": req.customer_name or "Dine-in Guest",
            "customer_phone": req.customer_phone,
            "server_id": user.get("id") if user else None,
            "server_name": user.get("role") if user else "Server",
            "items": items_doc,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "discount_amount": req.discount_amount,
            "discount_reason": req.discount_reason,
            "grand_total": grand_total,
            "status": "completed" if is_paid else "confirmed", # confirmed -> sent to kitchen
            "payment_status": "paid" if is_paid else ("partially_paid" if total_paid > 0 else "pending"),
            "payments": payment_entries,
            "notes": req.notes,
            "kitchen_notes": req.kitchen_notes,
            "idempotency_key": req.idempotency_key,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat() if is_paid else None
        }
        await self.orders_col.insert_one(order_doc)

        # Automatically deduct recipe inventory in real-time
        try:
            await InventoryService().deduct_order_inventory(order_doc)
        except Exception as e:
            logger.warning(f"Automatic inventory deduction failed for order {order_id}: {e}")

        # Broadcast to POS & KDS
        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:pos", {"event": "ORDER_CREATED", "data": order_doc})
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:kds", {"event": "KDS_TICKET_NEW", "data": order_doc})

        return order_doc

    async def process_payment(self, order_id: str, req: ProcessPaymentRequest) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        order = await self.orders_col.find_one({"id": order_id, "tenant_id": tenant_id})
        if not order:
            raise NotFoundException("Order", order_id)

        total_paid = sum(p.amount for p in req.payments)
        payment_entries = [p.model_dump() for p in req.payments]
        for p in payment_entries:
            p["created_at"] = datetime.now(timezone.utc).isoformat()
            if not p.get("transaction_ref"):
                p["transaction_ref"] = f"TXN-{order_id[:6].upper()}"

        existing_payments = order.get("payments", [])
        combined_payments = existing_payments + payment_entries
        total_collected = sum(p.get("amount", 0.0) for p in combined_payments)

        new_payment_status = "paid" if total_collected >= order.get("grand_total", 0.0) else "partially_paid"
        new_order_status = "completed" if new_payment_status == "paid" else order.get("status")

        update_data = {
            "payments": combined_payments,
            "payment_status": new_payment_status,
            "status": new_order_status,
            "tip_amount": req.tip_amount,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat() if new_payment_status == "paid" else None
        }
        await self.orders_col.update_one({"id": order_id}, {"$set": update_data})

        # Free up table if dine_in
        if new_payment_status == "paid" and order.get("table_id"):
            await self.tables_col.update_one(
                {"id": order["table_id"]},
                {"$set": {"status": "available", "current_order_id": None}}
            )
            if branch_id:
                await ws_manager.broadcast_to_channel(f"branch:{branch_id}:tables", {
                    "event": "TABLE_UPDATED",
                    "data": {"id": order["table_id"], "status": "available"}
                })

        updated_order = await self.orders_col.find_one({"id": order_id})

        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:pos", {"event": "PAYMENT_COMPLETED", "data": updated_order})

        return updated_order

    async def get_orders(self, status: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        query: Dict[str, Any] = {
            "tenant_id": tenant_id,
            "is_deleted": {"$ne": True}
        }
        if branch_id:
            query["branch_id"] = branch_id
        if status and status.lower() != "all":
            query["status"] = status.lower()

        cursor = self.orders_col.find(query).sort("created_at", -1)
        return await cursor.to_list(limit)
