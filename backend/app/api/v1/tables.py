from fastapi import APIRouter, Depends, Query, Body
from app.schemas.common import APIResponse
from app.schemas.table import TableCreateRequest, TableUpdateRequest
from app.services.table_service import TableService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tables", tags=["Tables & Floor Plan"])
table_service = TableService()

@router.get("/floor-plan", response_model=APIResponse[dict])
async def get_floor_plan(current_user: dict = Depends(get_current_user)):
    plan = await table_service.get_floor_plan()
    return APIResponse(data=plan, message="Floor plan retrieved")

@router.post("", response_model=APIResponse[dict])
async def create_table(req: TableCreateRequest, current_user: dict = Depends(get_current_user)):
    created = await table_service.create_table(req.model_dump())
    return APIResponse(data=created, message="Table created successfully")

@router.put("/{table_id}", response_model=APIResponse[dict])
@router.patch("/{table_id}", response_model=APIResponse[dict])
async def update_table(table_id: str, req: TableUpdateRequest, current_user: dict = Depends(get_current_user)):
    updated = await table_service.update_table(table_id, req.model_dump(exclude_unset=True))
    return APIResponse(data=updated, message="Table updated successfully")

@router.delete("/{table_id}", response_model=APIResponse[dict])
async def delete_table(table_id: str, current_user: dict = Depends(get_current_user)):
    res = await table_service.delete_table(table_id)
    return APIResponse(data=res, message="Table deleted successfully")

@router.patch("/{table_id}/status", response_model=APIResponse[dict])
async def update_status(table_id: str, status: str = Query(...), current_user: dict = Depends(get_current_user)):
    updated = await table_service.update_table_status(table_id, status)
    return APIResponse(data=updated, message="Table status updated")

@router.patch("/{table_id}/position", response_model=APIResponse[dict])
async def update_position(table_id: str, pos_x: int = Query(...), pos_y: int = Query(...), current_user: dict = Depends(get_current_user)):
    updated = await table_service.update_table(table_id, {"pos_x": pos_x, "pos_y": pos_y})
    return APIResponse(data=updated, message="Table position updated")

