from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TableCreateRequest(BaseModel):
    table_number: str
    capacity: int = Field(default=4, ge=1, le=50)
    shape: str = Field(default="square", description="square, round, rectangle")
    section_id: Optional[str] = None
    section_name: Optional[str] = "Main Dining"
    floor_id: Optional[str] = None
    floor_name: Optional[str] = "Ground Floor"
    status: str = Field(default="available", description="available, occupied, billing, reserved, cleaning")
    pos_x: int = 100
    pos_y: int = 100
    is_active: bool = True

class TableUpdateRequest(BaseModel):
    table_number: Optional[str] = None
    capacity: Optional[int] = Field(default=None, ge=1, le=50)
    shape: Optional[str] = None
    section_id: Optional[str] = None
    section_name: Optional[str] = None
    floor_id: Optional[str] = None
    floor_name: Optional[str] = None
    status: Optional[str] = None
    pos_x: Optional[int] = None
    pos_y: Optional[int] = None
    is_active: Optional[bool] = None
