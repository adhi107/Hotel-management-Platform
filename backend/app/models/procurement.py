from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class Vendor(TenantDocument):
    name: str
    company_name: str
    contact_person: str
    email: Optional[str] = None
    phone: str
    address: Optional[str] = None
    gst_number: Optional[str] = None
    categories_supplied: List[str] = Field(default_factory=list)
    rating: float = 4.8
    is_active: bool = True

class PurchaseOrderItem(BaseModel):
    ingredient_id: str
    ingredient_name: str
    quantity: float
    unit: str
    unit_price: float
    total_price: float
    received_quantity: float = 0.0

class PurchaseOrder(TenantDocument):
    po_number: str
    vendor_id: str
    vendor_name: str
    items: List[PurchaseOrderItem] = Field(default_factory=list)
    subtotal: float = 0.0
    tax_amount: float = 0.0
    total_amount: float = 0.0
    status: str = "draft" # draft, submitted, approved, partially_received, received, cancelled
    payment_status: str = "unpaid" # unpaid, partially_paid, paid
    delivery_expected_date: Optional[str] = None
    notes: Optional[str] = None

class GoodsReceiptNote(TenantDocument):
    grn_number: str
    po_id: str
    po_number: str
    vendor_id: str
    vendor_name: str
    received_items: List[PurchaseOrderItem] = Field(default_factory=list)
    quality_checked: bool = True
    received_by: Optional[str] = None
    invoice_number: Optional[str] = None
