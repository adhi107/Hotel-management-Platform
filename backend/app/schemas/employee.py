from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    department: str
    designation: str
    role: str = "waiter"
    salary: float = 0.0

class ClockInOutRequest(BaseModel):
    action: str # clock_in, clock_out, break_start, break_end
    notes: Optional[str] = None

class ShiftCreate(BaseModel):
    employee_id: str
    shift_date: str
    start_time: str
    end_time: str
    shift_type: str = "Morning"

class ExpenseCreate(BaseModel):
    category_name: str
    title: str
    amount: float
    expense_date: str
    payment_mode: str = "Cash"
    vendor_name: Optional[str] = None
    notes: Optional[str] = None

class DayCloseCreate(BaseModel):
    business_date: str
    actual_cash_counted: float
    opening_cash_float: float = 0.0
    notes: Optional[str] = None

class AIQueryRequest(BaseModel):
    query: str
    timeframe: Optional[str] = "today" # today, 7_days, 30_days, this_month

class AIQueryResponse(BaseModel):
    answer: str
    insights: List[str] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    data: Optional[Dict[str, Any]] = None
