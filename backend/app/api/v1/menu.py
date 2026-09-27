from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.schemas.common import APIResponse
from app.schemas.menu import CategoryCreate, ProductCreate
from app.services.menu_service import MenuService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/menu", tags=["Menu & Products"])
menu_service = MenuService()

@router.get("/categories", response_model=APIResponse[List[dict]])
async def list_categories():
    cats = await menu_service.list_categories()
    return APIResponse(data=cats, message="Categories listed")

@router.post("/categories", response_model=APIResponse[dict])
async def create_category(req: CategoryCreate, current_user: dict = Depends(get_current_user)):
    cat = await menu_service.create_category(req)
    return APIResponse(data=cat, message="Category created")

@router.get("/products", response_model=APIResponse[List[dict]])
async def list_products(category_id: Optional[str] = Query(None)):
    prods = await menu_service.list_products(category_id)
    return APIResponse(data=prods, message="Products listed")

@router.post("/products", response_model=APIResponse[dict])
async def create_product(req: ProductCreate, current_user: dict = Depends(get_current_user)):
    prod = await menu_service.create_product(req)
    return APIResponse(data=prod, message="Product created")

@router.put("/products/{product_id}", response_model=APIResponse[dict])
async def update_product(product_id: str, req: dict, current_user: dict = Depends(get_current_user)):
    updated = await menu_service.update_product(product_id, req)
    return APIResponse(data=updated, message="Product updated successfully")

@router.delete("/products/{product_id}", response_model=APIResponse[dict])
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    success = await menu_service.delete_product(product_id)
    return APIResponse(data={"success": success}, message="Product deleted successfully")
