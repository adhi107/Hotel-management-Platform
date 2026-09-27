from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.procurement import PurchaseOrderItem

class VendorCreate(BaseModel):
    name: str
    company_name: str
    contact_person: str
    email: Optional[str] = None
    phone: str
    address: Optional[str] = None
    gst_number: Optional[str] = None
    categories_supplied: List[str] = Field(default_factory=list)

class PurchaseOrderCreate(BaseModel):
    vendor_id: str
    items: List[PurchaseOrderItem]
    delivery_expected_date: Optional[str] = None
    notes: Optional[str] = None

class GRNCreate(BaseModel):
    po_id: str
    received_items: List[PurchaseOrderItem]
    quality_checked: bool = True
    invoice_number: Optional[str] = None
