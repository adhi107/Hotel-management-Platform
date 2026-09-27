from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.schemas.common import APIResponse
from app.schemas.tenant import BusinessProfileUpdate, BranchCreate
from app.services.tenant_service import TenantService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tenants", tags=["Tenants & Profile"])
tenant_service = TenantService()

@router.get("/profile", response_model=APIResponse[dict])
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await tenant_service.get_current_tenant_profile()
    return APIResponse(data=profile, message="Business profile retrieved")

@router.put("/profile", response_model=APIResponse[dict])
async def update_profile(req: BusinessProfileUpdate, current_user: dict = Depends(get_current_user)):
    updated = await tenant_service.update_business_profile(req)
    return APIResponse(data=updated, message="Business profile updated successfully")

@router.post("/apply-template/{template_name}", response_model=APIResponse[dict])
async def apply_template(template_name: str, current_user: dict = Depends(get_current_user)):
    updated = await tenant_service.apply_business_template(template_name)
    return APIResponse(data=updated, message=f"Template '{template_name}' applied successfully")

@router.get("/branches", response_model=APIResponse[List[dict]])
async def list_branches(current_user: dict = Depends(get_current_user)):
    branches = await tenant_service.list_branches()
    return APIResponse(data=branches, message="Branches listed")

@router.post("/branches", response_model=APIResponse[dict])
async def create_branch(req: BranchCreate, current_user: dict = Depends(get_current_user)):
    created = await tenant_service.create_branch(req)
    return APIResponse(data=created, message="Branch created successfully")
