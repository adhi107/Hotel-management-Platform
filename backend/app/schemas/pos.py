from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from app.models.order import OrderItem, PaymentTender, SelectedModifier

class QuickSaleItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: Optional[str] = None
    product_name: str
    unit_price: float
    quantity: int = 1
    notes: Optional[str] = None

class QuickSaleRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[QuickSaleItem]
    payment_method: str = "cash" # cash, upi, card, khata
    customer_id: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    discount_amount: float = 0.0
    notes: Optional[str] = None

class CreateOrderItemInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    product_id: Optional[str] = None
    product_name: str
    variant_id: Optional[str] = None
    variant_name: Optional[str] = None
    unit_price: float
    quantity: int = 1
    total_price: Optional[float] = None
    cost_price: float = 0.0
    modifiers: List[SelectedModifier] = Field(default_factory=list)
    special_instructions: Optional[str] = None
    notes: Optional[str] = None
    kitchen_station: str = "Kitchen"
    status: str = "pending"

class CreateOrderRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_type: str = "dine_in" # dine_in, takeaway, delivery, qr_order, quick_sale
    table_id: Optional[str] = None
    table_number: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    server_id: Optional[str] = None
    items: List[CreateOrderItemInput] = Field(default_factory=list)
    payments: List[PaymentTender] = Field(default_factory=list)
    discount_amount: float = 0.0
    discount_reason: Optional[str] = None
    notes: Optional[str] = None
    kitchen_notes: Optional[str] = None
    idempotency_key: Optional[str] = None

class UpdateOrderItemsRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[CreateOrderItemInput]

class ProcessPaymentRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    payments: List[PaymentTender]
    tip_amount: float = 0.0
    notes: Optional[str] = None

class OrderStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: str
    notes: Optional[str] = None

