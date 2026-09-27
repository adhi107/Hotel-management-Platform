import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.schemas.inventory import RecipeCreateRequest
from app.core.exceptions import NotFoundException

class RecipeService:
    def __init__(self):
        self.recipes_col = get_collection("recipes")
        self.products_col = get_collection("products")
        self.ingredients_col = get_collection("ingredients")

    async def list_recipes(self) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        cursor = self.recipes_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}})
        return await cursor.to_list(200)

    async def create_or_update_recipe(self, req: RecipeCreateRequest) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        
        product = await self.products_col.find_one({"id": req.product_id, "tenant_id": tenant_id})
        if not product:
            raise NotFoundException("Product", req.product_id)

        # Calculate total food cost from ingredient items
        total_food_cost = 0.0
        calculated_ingredients = []
        for ing_item in req.ingredients:
            cost = round(ing_item.quantity * ing_item.unit_cost, 2)
            total_food_cost += cost
            calculated_ingredients.append({
                "ingredient_id": ing_item.ingredient_id,
                "ingredient_name": ing_item.ingredient_name,
                "quantity": ing_item.quantity,
                "unit": ing_item.unit,
                "unit_cost": ing_item.unit_cost,
                "total_cost": cost
            })

        total_food_cost = round(total_food_cost, 2)
        selling_price = req.selling_price or product.get("base_price", 100.0)
        food_cost_pct = round((total_food_cost / selling_price * 100.0), 2) if selling_price > 0 else 0.0
        gross_margin_amount = round(selling_price - total_food_cost, 2)
        gross_margin_pct = round(100.0 - food_cost_pct, 2)

        existing = await self.recipes_col.find_one({"product_id": req.product_id, "tenant_id": tenant_id})
        if existing:
            update_data = {
                "yield_servings": req.yield_servings,
                "ingredients": calculated_ingredients,
                "total_food_cost": total_food_cost,
                "selling_price": selling_price,
                "food_cost_percentage": food_cost_pct,
                "gross_margin_amount": gross_margin_amount,
                "gross_margin_percentage": gross_margin_pct,
                "instructions": req.instructions,
                "version": existing.get("version", 1) + 1,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await self.recipes_col.update_one({"id": existing["id"]}, {"$set": update_data})
            # Also update product cost_price
            await self.products_col.update_one({"id": req.product_id}, {"$set": {"cost_price": total_food_cost}})
            return await self.recipes_col.find_one({"id": existing["id"]})
        else:
            recipe_id = str(uuid.uuid4())
            doc = {
                "_id": recipe_id,
                "id": recipe_id,
                "tenant_id": tenant_id,
                "branch_id": branch_id,
                "product_id": req.product_id,
                "product_name": product["name"],
                "yield_servings": req.yield_servings,
                "ingredients": calculated_ingredients,
                "total_food_cost": total_food_cost,
                "selling_price": selling_price,
                "food_cost_percentage": food_cost_pct,
                "gross_margin_amount": gross_margin_amount,
                "gross_margin_percentage": gross_margin_pct,
                "instructions": req.instructions,
                "version": 1,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await self.recipes_col.insert_one(doc)
            await self.products_col.update_one(
                {"id": req.product_id},
                {"$set": {"cost_price": total_food_cost, "recipe_id": recipe_id}}
            )
            return doc
