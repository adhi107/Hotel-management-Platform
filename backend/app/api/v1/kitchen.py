from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.schemas.common import APIResponse
from app.services.kitchen_service import KitchenService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/kitchen", tags=["Kitchen Display System"])
kitchen_service = KitchenService()

@router.get("/tickets", response_model=APIResponse[List[dict]])
async def get_tickets(station: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    tickets = await kitchen_service.get_kds_tickets(station)
    return APIResponse(data=tickets, message="KDS tickets retrieved")

@router.patch("/tickets/{order_id}/status", response_model=APIResponse[dict])
async def update_ticket_status(order_id: str, status: str = Query(...), current_user: dict = Depends(get_current_user)):
    updated = await kitchen_service.update_ticket_status(order_id, status)
    return APIResponse(data=updated, message="Ticket status updated")

@router.patch("/tickets/{order_id}/items/{item_id}/status", response_model=APIResponse[dict])
async def update_item_status(order_id: str, item_id: str, status: str = Query(...), current_user: dict = Depends(get_current_user)):
    updated = await kitchen_service.update_item_status(order_id, item_id, status)
    return APIResponse(data=updated, message="Item status updated")

@router.get("/analytics", response_model=APIResponse[dict])
async def get_kitchen_analytics(current_user: dict = Depends(get_current_user)):
    """Real-time kitchen performance analytics for Head Chef"""
    analytics = await kitchen_service.get_kitchen_analytics()
    return APIResponse(data=analytics, message="Kitchen analytics retrieved")

@router.post("/tickets/{order_id}/bump", response_model=APIResponse[dict])
async def bump_ticket(order_id: str, current_user: dict = Depends(get_current_user)):
    """Bump ticket to served/completed - fast action for KDS"""
    updated = await kitchen_service.bump_ticket(order_id)
    return APIResponse(data=updated, message="Ticket bumped successfully")

@router.get("/rush-status", response_model=APIResponse[dict])
async def get_rush_status(current_user: dict = Depends(get_current_user)):
    """Get current kitchen rush level and load prediction"""
    status = await kitchen_service.get_rush_status()
    return APIResponse(data=status, message="Rush status retrieved")
