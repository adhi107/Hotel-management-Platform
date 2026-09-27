import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.schemas.menu import CategoryCreate, ProductCreate, ModifierGroupCreate
from app.core.exceptions import NotFoundException

class MenuService:
    def __init__(self):
        self.categories_col = get_collection("categories")
        self.products_col = get_collection("products")
        self.modifier_groups_col = get_collection("modifier_groups")

    async def list_categories(self) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        query: Dict[str, Any] = {"is_deleted": {"$ne": True}}
        if tenant_id:
            query["tenant_id"] = {"$in": [tenant_id, "tenant-aura-enterprise-001"]}
        cursor = self.categories_col.find(query).sort("sort_order", 1)
        cats = await cursor.to_list(200)
        if not cats:
            cursor = self.categories_col.find({"is_deleted": {"$ne": True}}).sort("sort_order", 1)
            cats = await cursor.to_list(200)
        return cats

    async def create_category(self, req: CategoryCreate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        cat_id = str(uuid.uuid4())
        doc = {
            "_id": cat_id,
            "id": cat_id,
            "tenant_id": tenant_id,
            "name": req.name,
            "slug": req.name.lower().replace(" ", "-"),
            "description": req.description,
            "icon": req.icon,
            "sort_order": req.sort_order,
            "parent_id": req.parent_id,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.categories_col.insert_one(doc)
        return doc

    async def list_products(self, category_id: Optional[str] = None) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        query: Dict[str, Any] = {"is_deleted": {"$ne": True}}
        if tenant_id:
            query["tenant_id"] = {"$in": [tenant_id, "tenant-aura-enterprise-001"]}
        if category_id and category_id != "all":
            query["category_id"] = category_id
        cursor = self.products_col.find(query).sort("name", 1)
        prods = await cursor.to_list(500)
        if not prods:
            fallback_query: Dict[str, Any] = {"is_deleted": {"$ne": True}}
            if category_id and category_id != "all":
                fallback_query["category_id"] = category_id
            cursor = self.products_col.find(fallback_query).sort("name", 1)
            prods = await cursor.to_list(500)
        return prods

    async def create_product(self, req: ProductCreate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        prod_id = str(uuid.uuid4())
        doc = {
            "_id": prod_id,
            "id": prod_id,
            "tenant_id": tenant_id,
            "category_id": req.category_id,
            "name": req.name,
            "slug": req.name.lower().replace(" ", "-"),
            "description": req.description,
            "sku": req.sku or f"SKU-{prod_id[:8].upper()}",
            "barcode": req.barcode,
            "base_price": req.base_price,
            "cost_price": req.cost_price,
            "tax_rate": req.tax_rate,
            "image_url": req.image_url,
            "is_available": req.is_available,
            "is_vegetarian": req.is_vegetarian,
            "is_vegan": req.is_vegan,
            "is_gluten_free": req.is_gluten_free,
            "is_jain": req.is_jain,
            "spice_level": req.spice_level,
            "calories": req.calories,
            "prep_time_minutes": req.prep_time_minutes,
            "kitchen_station": req.kitchen_station,
            "variants": [v.model_dump() for v in req.variants],
            "modifier_group_ids": req.modifier_group_ids,
            "allergens": req.allergens,
            "available_schedules": req.available_schedules,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.products_col.insert_one(doc)
        return doc

    async def list_modifier_groups(self) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        cursor = self.modifier_groups_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}})
        return await cursor.to_list(100)

    async def update_product(self, product_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        clean_updates = {k: v for k, v in updates.items() if v is not None}
        clean_updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        if "name" in clean_updates:
            clean_updates["slug"] = clean_updates["name"].lower().replace(" ", "-")
        
        await self.products_col.update_one(
            {"id": product_id, "tenant_id": tenant_id},
            {"$set": clean_updates}
        )
        updated = await self.products_col.find_one({"id": product_id, "tenant_id": tenant_id})
        if not updated:
            raise NotFoundException(f"Product {product_id} not found")
        return updated

    async def delete_product(self, product_id: str) -> bool:
        tenant_id = TenantContext.get_tenant_id()
        res = await self.products_col.update_one(
            {"id": product_id, "tenant_id": tenant_id},
            {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return res.modified_count > 0
