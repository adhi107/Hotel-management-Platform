from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_id: Optional[str] = None
    branch_id: Optional[str] = None
    device_info: Optional[str] = "Desktop Web"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    tenant: Optional[Dict[str, Any]] = None
    branches: List[Dict[str, Any]] = Field(default_factory=list)

class RegisterRequest(BaseModel):
    business_name: str
    owner_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    business_type: str = "Restaurant"
    business_size: str = "small"
    city: str = "Hyderabad"
    state: str = "Telangana"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "waiter"
    assigned_branch_ids: List[str] = Field(default_factory=list)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    assigned_branch_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None

class RoleCreate(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    permissions: List[str] = Field(default_factory=list)
