import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.models.tenant import Tenant, Branch, Brand, BUSINESS_TEMPLATES, FeatureFlags, WhiteLabelConfig
from app.schemas.tenant import BusinessProfileUpdate, BranchCreate, BrandCreate
from app.core.exceptions import NotFoundException

class TenantService:
    def __init__(self):
        self.tenants_col = get_collection("tenants")
        self.branches_col = get_collection("branches")
        self.brands_col = get_collection("brands")

    async def get_current_tenant_profile(self) -> Optional[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        if not tenant_id:
            return None
        return await self.tenants_col.find_one({"id": tenant_id})

    async def update_business_profile(self, req: BusinessProfileUpdate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        update_data = {
            "business_type": req.business_type,
            "business_size": req.business_size,
            "ui_mode": req.ui_mode,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        if req.features:
            update_data["features"] = req.features
        if req.config:
            update_data["config"] = req.config.model_dump()

        await self.tenants_col.update_one({"id": tenant_id}, {"$set": update_data})
        return await self.tenants_col.find_one({"id": tenant_id})

    async def apply_business_template(self, template_name: str) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        template = BUSINESS_TEMPLATES.get(template_name, BUSINESS_TEMPLATES.get("Restaurant"))
        if not template:
            template = BUSINESS_TEMPLATES["Restaurant"]

        update_data = {
            "business_type": template_name,
            "business_size": template.get("business_size", "small"),
            "ui_mode": template.get("ui_mode", "standard"),
            "features": template.get("features", {}),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.tenants_col.update_one({"id": tenant_id}, {"$set": update_data})
        return await self.tenants_col.find_one({"id": tenant_id})

    async def list_branches(self) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        cursor = self.branches_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}})
        return await cursor.to_list(100)

    async def create_branch(self, req: BranchCreate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        org_id = TenantContext.get_org_id()
        branch_id = str(uuid.uuid4())

        branch_doc = {
            "_id": branch_id,
            "id": branch_id,
            "tenant_id": tenant_id,
            "organization_id": org_id,
            "name": req.name,
            "code": req.code,
            "address": req.address,
            "city": req.city,
            "state": req.state,
            "pincode": req.pincode,
            "phone": req.phone,
            "email": req.email,
            "table_count": req.table_count,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.branches_col.insert_one(branch_doc)
        return branch_doc
