from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class Customer(TenantDocument):
    name: str
    phone: str
    email: Optional[str] = None
    birthday: Optional[str] = None
    anniversary: Optional[str] = None
    tier: str = "Bronze" # Bronze, Silver, Gold, Platinum
    loyalty_points: int = 0
    total_spent: float = 0.0
    total_visits: int = 0
    average_order_value: float = 0.0
    favorite_items: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    preferences: Optional[str] = None
    tags: List[str] = Field(default_factory=lambda: ["New"]) # New, Regular, VIP, Churn Risk
    last_visit: Optional[str] = None

class LoyaltyTransaction(TenantDocument):
    customer_id: str
    customer_name: str
    transaction_type: str # earned, redeemed, expired, adjusted
    points: int
    order_id: Optional[str] = None
    description: str
