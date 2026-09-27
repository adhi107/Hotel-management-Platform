from fastapi import APIRouter, Depends
from typing import List
from app.schemas.common import APIResponse
from app.schemas.crm import CustomerCreate, KhataEntryCreate
from app.services.crm_service import CrmService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/crm", tags=["CRM & Khata Credit"])
crm_service = CrmService()

@router.get("/customers", response_model=APIResponse[List[dict]])
async def list_customers(current_user: dict = Depends(get_current_user)):
    custs = await crm_service.list_customers()
    return APIResponse(data=custs, message="Customers listed")

@router.post("/customers", response_model=APIResponse[dict])
async def create_customer(req: CustomerCreate, current_user: dict = Depends(get_current_user)):
    cust = await crm_service.create_customer(req)
    return APIResponse(data=cust, message="Customer profile created")

@router.get("/khata", response_model=APIResponse[List[dict]])
async def get_khata(current_user: dict = Depends(get_current_user)):
    khata = await crm_service.get_khata_ledger()
    return APIResponse(data=khata, message="Khata credit ledger retrieved")

@router.post("/khata/entry", response_model=APIResponse[dict])
async def record_khata_entry(req: KhataEntryCreate, current_user: dict = Depends(get_current_user)):
    res = await crm_service.record_khata_entry(req)
    return APIResponse(data=res, message="Khata entry recorded")
