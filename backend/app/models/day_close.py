from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.base import TenantDocument

class DayClose(TenantDocument):
    business_date: str # YYYY-MM-DD
    closed_at: str
    closed_by_user_id: str
    closed_by_name: str
    total_orders: int = 0
    total_sales: float = 0.0
    cash_sales: float = 0.0
    upi_sales: float = 0.0
    card_sales: float = 0.0
    khata_credit_sales: float = 0.0
    total_refunds: float = 0.0
    total_discounts: float = 0.0
    total_expenses: float = 0.0
    total_khata_collections: float = 0.0
    opening_cash_float: float = 0.0
    expected_cash_in_drawer: float = 0.0
    actual_cash_counted: float = 0.0
    cash_discrepancy: float = 0.0 # actual - expected
    notes: Optional[str] = None
    summary_metrics: Dict[str, Any] = Field(default_factory=dict)
