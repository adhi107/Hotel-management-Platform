from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.schemas.common import APIResponse
from app.schemas.pos import QuickSaleRequest, CreateOrderRequest, ProcessPaymentRequest
from app.services.pos_service import PosService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/pos", tags=["POS & Quick Sale"])
pos_service = PosService()

@router.post("/quick-sale", response_model=APIResponse[dict])
async def quick_sale(req: QuickSaleRequest, current_user: dict = Depends(get_current_user)):
    res = await pos_service.quick_sale(req)
    return APIResponse(data=res, message="Quick sale completed successfully")

@router.post("/orders", response_model=APIResponse[dict])
async def create_order(req: CreateOrderRequest, current_user: dict = Depends(get_current_user)):
    res = await pos_service.create_order(req)
    return APIResponse(data=res, message="Order placed successfully")

@router.get("/orders", response_model=APIResponse[List[dict]])
async def get_orders(status: str = None, limit: int = 100, current_user: dict = Depends(get_current_user)):
    orders = await pos_service.get_orders(status=status, limit=limit)
    return APIResponse(data=orders, message="Orders retrieved successfully")

@router.post("/orders/{order_id}/pay", response_model=APIResponse[dict])
async def pay_order(order_id: str, req: ProcessPaymentRequest, current_user: dict = Depends(get_current_user)):
    res = await pos_service.process_payment(order_id, req)
    return APIResponse(data=res, message="Payment recorded successfully")
