from fastapi import APIRouter, Depends, Query
from app.schemas.common import APIResponse
from app.services.reporting_service import ReportingService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["Reporting & BI"])
rep_service = ReportingService()

@router.get("/dashboard-metrics", response_model=APIResponse[dict])
async def get_dashboard_metrics(timeframe: str = Query("today"), current_user: dict = Depends(get_current_user)):
    metrics = await rep_service.get_dashboard_metrics(timeframe)
    return APIResponse(data=metrics, message="Dashboard KPIs retrieved")

@router.get("/menu-intelligence", response_model=APIResponse[dict])
async def get_menu_intelligence(current_user: dict = Depends(get_current_user)):
    matrix = await rep_service.get_menu_intelligence()
    return APIResponse(data=matrix, message="Menu intelligence matrix retrieved")

@router.get("/live-ops", response_model=APIResponse[dict])
async def get_live_ops(current_user: dict = Depends(get_current_user)):
    """Owner Live Operations: real-time revenue, orders, and kitchen status"""
    data = await rep_service.get_live_ops()
    return APIResponse(data=data, message="Live ops data retrieved")

@router.get("/hourly-heatmap", response_model=APIResponse[dict])
async def get_hourly_heatmap(current_user: dict = Depends(get_current_user)):
    """Hourly revenue and order heatmap for today"""
    data = await rep_service.get_hourly_heatmap()
    return APIResponse(data=data, message="Hourly heatmap retrieved")

@router.get("/sales-analytics", response_model=APIResponse[dict])
async def get_sales_analytics(
    timeframe: str = Query("today"),
    start_date: str = Query(None),
    end_date: str = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Detailed sales analytics: day-wise, week-wise, month-wise, top & least ordered items, and growth insights"""
    data = await rep_service.get_sales_analytics(timeframe, start_date, end_date)
    return APIResponse(data=data, message="Sales analytics retrieved")

