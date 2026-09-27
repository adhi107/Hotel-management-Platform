from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from app.models.base import BaseDocument, TenantDocument

class Permission(BaseModel):
    module: str
    resource: str
    action: str
    scope: str = "branch" # own, department, branch, organization, all

class Role(TenantDocument):
    name: str
    display_name: str
    description: Optional[str] = None
    is_system_role: bool = False
    permissions: List[str] = Field(default_factory=list)

class User(TenantDocument):
    email: EmailStr
    hashed_password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "waiter"
    assigned_branch_ids: List[str] = Field(default_factory=list)
    is_active: bool = True
    is_super_admin: bool = False
    two_factor_enabled: bool = False
    avatar_url: Optional[str] = None
    last_login: Optional[str] = None
    last_ip: Optional[str] = None

class SessionRecord(BaseDocument):
    user_id: str
    tenant_id: Optional[str] = None
    refresh_token_hash: str
    device_info: str = "Desktop Browser"
    ip_address: str = "127.0.0.1"
    is_revoked: bool = False
    expires_at: str

class AuditLog(TenantDocument):
    user_id: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    module: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
