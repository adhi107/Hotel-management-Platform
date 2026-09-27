from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class Floor(TenantDocument):
    name: str
    level: int = 1
    description: Optional[str] = None

class Section(TenantDocument):
    floor_id: str
    name: str # Indoor, Rooftop, Patio, AC Hall, Bar Lounge
    color_code: Optional[str] = "#3B82F6"

class Table(TenantDocument):
    floor_id: str
    section_id: str
    table_number: str
    capacity: int = 4
    shape: str = "square" # square, round, rectangle
    status: str = "available" # available, occupied, billing, reserved, cleaning
    current_order_id: Optional[str] = None
    qr_code_token: Optional[str] = None
    pos_x: int = 100
    pos_y: int = 100
    is_active: bool = True
