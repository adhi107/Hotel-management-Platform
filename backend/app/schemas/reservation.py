from pydantic import BaseModel, Field
from typing import Optional

class ReservationCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    party_size: int = 2
    reservation_date: str # YYYY-MM-DD
    time_slot: str # HH:MM
    table_id: Optional[str] = None
    special_requests: Optional[str] = None
    occasion: Optional[str] = None

class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    table_id: Optional[str] = None
    table_number: Optional[str] = None
    party_size: Optional[int] = None
    special_requests: Optional[str] = None

class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    department: str
    designation: str
    role: str
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
