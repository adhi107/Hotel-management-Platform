from pydantic import BaseModel, Field
from typing import Optional, List

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    birthday: Optional[str] = None
    anniversary: Optional[str] = None
    preferences: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)

class LoyaltyRedeemRequest(BaseModel):
    customer_id: str
    points_to_redeem: int
    order_id: Optional[str] = None

class KhataEntryCreate(BaseModel):
    customer_id: str
    entry_type: str # credit, payment
    amount: float
    payment_mode: Optional[str] = "cash" # cash, upi, bank
    order_id: Optional[str] = None
    description: Optional[str] = None
