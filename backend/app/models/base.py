from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

class BaseDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    is_deleted: bool = False

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class TenantDocument(BaseDocument):
    tenant_id: Optional[str] = None
    organization_id: Optional[str] = None
    brand_id: Optional[str] = None
    branch_id: Optional[str] = None
