from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.base import TenantDocument

class SelectedModifier(BaseModel):
    group_id: str
    option_id: str
    name: str
    price: float

class OrderItem(BaseModel):
    id: str
    product_id: str
    product_name: str
    variant_id: Optional[str] = None
    variant_name: Optional[str] = None
    unit_price: float
    quantity: int = 1
    total_price: float
    cost_price: float = 0.0
    modifiers: List[SelectedModifier] = Field(default_factory=list)
    special_instructions: Optional[str] = None
    kitchen_station: str = "Kitchen"
    status: str = "pending" # pending, preparing, ready, served, cancelled
    prepared_at: Optional[str] = None
    recipe_id: Optional[str] = None

class PaymentTender(BaseModel):
    method: str # cash, card, upi, wallet, credit
    amount: float
    transaction_ref: Optional[str] = None
    status: str = "completed"
    created_at: Optional[str] = None

class Order(TenantDocument):
    order_number: str
    order_type: str = "dine_in" # dine_in, takeaway, delivery, qr_order
    table_id: Optional[str] = None
    table_number: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    server_id: Optional[str] = None
    server_name: Optional[str] = None
    items: List[OrderItem] = Field(default_factory=list)
    subtotal: float = 0.0
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    discount_reason: Optional[str] = None
    service_charge: float = 0.0
    delivery_charge: float = 0.0
    tip_amount: float = 0.0
    grand_total: float = 0.0
    total_cost: float = 0.0
    gross_margin: float = 0.0
    status: str = "draft" # draft, confirmed, accepted, preparing, ready, served, completed, cancelled, refunded
    payment_status: str = "pending" # pending, partially_paid, paid, refunded
    payments: List[PaymentTender] = Field(default_factory=list)
    notes: Optional[str] = None
    kitchen_notes: Optional[str] = None
    idempotency_key: Optional[str] = None
    is_synced: bool = True
    completed_at: Optional[str] = None
