from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class DayCloseCreate(BaseModel):
    business_date: str
    actual_cash_counted: float
    opening_cash_float: float = 0.0
    notes: Optional[str] = None
