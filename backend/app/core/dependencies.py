from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any, List
from app.core.security import decode_token
from app.core.tenant_context import TenantContext
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.permissions import has_permission
from app.core.database import get_database

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    if not credentials:
        raise UnauthorizedException("Authentication token missing")
    
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise UnauthorizedException("Invalid token type")
        
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token subject")
            
        return {
            "id": user_id,
            "tenant_id": payload.get("tenant_id"),
            "org_id": payload.get("org_id"),
            "branch_id": payload.get("branch_id"),
            "role": payload.get("role", "customer"),
            "permissions": payload.get("permissions", [])
        }
    except Exception as e:
        raise UnauthorizedException(f"Could not validate credentials: {str(e)}")

def require_permission(permission: str):
    async def permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_perms = current_user.get("permissions", [])
        user_role = current_user.get("role")
        
        if user_role == "super_admin":
            return current_user
            
        if not has_permission(user_perms, permission):
            raise ForbiddenException(f"Permission denied. Required: '{permission}'")
            
        return current_user
    return permission_checker

def require_super_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") != "super_admin":
        raise ForbiddenException("Super Admin access required")
    return current_user
