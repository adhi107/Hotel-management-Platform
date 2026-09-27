from fastapi import APIRouter, Depends
from typing import List
from app.schemas.common import APIResponse
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/alerts", tags=["Smart Alerts & Notifications"])

@router.get("", response_model=APIResponse[List[dict]])
async def list_alerts(current_user: dict = Depends(get_current_user)):
    tenant_id = TenantContext.get_tenant_id()
    alerts_col = get_collection("alerts")
    alerts = await alerts_col.find({"tenant_id": tenant_id, "is_resolved": {"$ne": True}}).to_list(100)
    return APIResponse(data=alerts, message="Active smart alerts retrieved")

@router.patch("/{alert_id}/resolve", response_model=APIResponse[dict])
async def resolve_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    alerts_col = get_collection("alerts")
    await alerts_col.update_one({"id": alert_id}, {"$set": {"is_resolved": True}})
    return APIResponse(data={"id": alert_id, "is_resolved": True}, message="Alert marked as resolved")
