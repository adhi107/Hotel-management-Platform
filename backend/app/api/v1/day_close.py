from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.common import APIResponse
from app.schemas.day_close import DayCloseCreate
from app.services.day_close_service import DayCloseService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/day-close", tags=["Day Close"])
day_close_service = DayCloseService()

@router.get("/summary", response_model=APIResponse[dict])
async def get_summary(business_date: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    summary = await day_close_service.get_day_summary(business_date)
    return APIResponse(data=summary, message="Day summary calculated")

@router.post("/close", response_model=APIResponse[dict])
async def execute_close(req: DayCloseCreate, current_user: dict = Depends(get_current_user)):
    res = await day_close_service.execute_day_close(req)
    return APIResponse(data=res, message="Business day closed successfully")
