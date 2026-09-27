from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class KhataEntry(BaseModel):
    id: str
    entry_type: str # credit (gave food on credit), payment (received cash/upi)
    amount: float
    payment_mode: Optional[str] = None # cash, upi, bank
    order_id: Optional[str] = None
    description: Optional[str] = None
    created_at: str
    created_by: Optional[str] = None

class CustomerKhata(TenantDocument):
    customer_id: str
    customer_name: str
    customer_phone: str
    credit_limit: float = 5000.0
    total_credit: float = 0.0
    total_paid: float = 0.0
    current_balance: float = 0.0 # total_credit - total_paid (positive means customer owes money)
    status: str = "active" # active, blocked, settled
    last_payment_date: Optional[str] = None
    last_reminder_sent: Optional[str] = None
    entries: List[KhataEntry] = Field(default_factory=list)
