from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class Reservation(TenantDocument):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    party_size: int = 2
    reservation_date: str # YYYY-MM-DD
    time_slot: str # HH:MM (e.g. 19:30)
    duration_minutes: int = 90
    table_id: Optional[str] = None
    table_number: Optional[str] = None
    status: str = "confirmed" # confirmed, seated, cancelled, no_show, waitlist
    special_requests: Optional[str] = None
    occasion: Optional[str] = None # Birthday, Anniversary, Business, Date
