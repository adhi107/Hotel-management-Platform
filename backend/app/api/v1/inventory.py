from fastapi import APIRouter, Depends, Query, Path
from typing import List, Optional, Dict, Any
from app.schemas.common import APIResponse
from app.schemas.inventory import (
    IngredientCreate,
    IngredientUpdate,
    StockAdjustmentRequest,
    WastageCreateRequest,
    BulkStockInRequest,
)
from app.services.inventory_service import InventoryService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/inventory", tags=["Inventory & Ingredients"])
inv_service = InventoryService()

@router.get("/ingredients", response_model=APIResponse[List[dict]])
async def list_ingredients(
    low_stock_only: bool = Query(False),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    items = await inv_service.list_ingredients(low_stock_only=low_stock_only, category=category, search=search)
    return APIResponse(data=items, message="Ingredients retrieved")

@router.get("/ingredients/{ingredient_id}", response_model=APIResponse[dict])
async def get_ingredient(
    ingredient_id: str = Path(...),
    current_user: dict = Depends(get_current_user)
):
    item = await inv_service.get_ingredient(ingredient_id)
    return APIResponse(data=item, message="Ingredient details retrieved")

@router.post("/ingredients", response_model=APIResponse[dict])
async def create_ingredient(
    req: IngredientCreate,
    current_user: dict = Depends(get_current_user)
):
    item = await inv_service.create_ingredient(req)
    return APIResponse(data=item, message="Ingredient created successfully")

@router.put("/ingredients/{ingredient_id}", response_model=APIResponse[dict])
async def update_ingredient(
    ingredient_id: str = Path(...),
    req: IngredientUpdate = ...,
    current_user: dict = Depends(get_current_user)
):
    item = await inv_service.update_ingredient(ingredient_id, req)
    return APIResponse(data=item, message="Ingredient updated successfully")

@router.delete("/ingredients/{ingredient_id}", response_model=APIResponse[dict])
async def delete_ingredient(
    ingredient_id: str = Path(...),
    current_user: dict = Depends(get_current_user)
):
    res = await inv_service.delete_ingredient(ingredient_id)
    return APIResponse(data=res, message="Ingredient archived")

@router.post("/adjust-stock", response_model=APIResponse[dict])
async def adjust_stock(
    req: StockAdjustmentRequest,
    current_user: dict = Depends(get_current_user)
):
    res = await inv_service.adjust_stock(req)
    return APIResponse(data=res, message="Stock adjusted successfully")

@router.post("/wastage", response_model=APIResponse[dict])
async def record_wastage(
    req: WastageCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    res = await inv_service.record_wastage(req)
    return APIResponse(data=res, message="Wastage recorded successfully")

@router.post("/bulk-stock-in", response_model=APIResponse[dict])
async def bulk_stock_in(
    req: BulkStockInRequest,
    current_user: dict = Depends(get_current_user)
):
    res = await inv_service.bulk_stock_in(req)
    return APIResponse(data=res, message="Bulk stock replenishment completed")

@router.get("/transactions", response_model=APIResponse[List[dict]])
async def get_transactions(
    ingredient_id: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    limit: int = Query(100),
    current_user: dict = Depends(get_current_user)
):
    items = await inv_service.get_transactions(ingredient_id=ingredient_id, transaction_type=transaction_type, limit=limit)
    return APIResponse(data=items, message="Inventory transactions retrieved")

@router.get("/analytics", response_model=APIResponse[dict])
async def get_analytics(
    current_user: dict = Depends(get_current_user)
):
    data = await inv_service.get_analytics()
    return APIResponse(data=data, message="Inventory analytics retrieved")

@router.get("/reorder-suggestions", response_model=APIResponse[List[dict]])
async def get_reorder_suggestions(
    current_user: dict = Depends(get_current_user)
):
    data = await inv_service.get_reorder_suggestions()
    return APIResponse(data=data, message="Reorder recommendations retrieved")
