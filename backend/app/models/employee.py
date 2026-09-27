from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class Employee(TenantDocument):
    user_id: Optional[str] = None
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: str
    department: str # Service, Kitchen, Management, Bar, Housekeeping
    designation: str # Head Chef, Captain, Bartender, Line Cook, Cashier
    role: str # matches Role name
    date_of_joining: str
    salary: float = 0.0
    is_active: bool = True
    clock_in_status: str = "clocked_out" # clocked_in, on_break, clocked_out
    total_sales_generated: float = 0.0
    orders_served_count: int = 0

class Shift(TenantDocument):
    employee_id: str
    employee_name: str
    shift_date: str # YYYY-MM-DD
    start_time: str # 09:00
    end_time: str # 17:00
    shift_type: str # Morning, Evening, Night, Double
    status: str = "scheduled" # scheduled, completed, absent, leave

class Attendance(TenantDocument):
    employee_id: str
    employee_name: str
    attendance_date: str
    clock_in: str
    clock_out: Optional[str] = None
    break_duration_minutes: int = 0
    total_hours: float = 0.0
    status: str = "present" # present, late, half_day, overtime
