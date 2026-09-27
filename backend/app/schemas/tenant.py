from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.tenant import FeatureFlags, WhiteLabelConfig

class BranchCreate(BaseModel):
    name: str
    code: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: Optional[str] = None
    table_count: int = 24

class BrandCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cuisine_type: List[str] = Field(default_factory=list)
    logo_url: Optional[str] = None

class BusinessProfileUpdate(BaseModel):
    business_type: str
    business_size: str
    ui_mode: str
    features: Optional[Dict[str, bool]] = None
    config: Optional[WhiteLabelConfig] = None

class FeatureToggleRequest(BaseModel):
    features: Dict[str, bool]
