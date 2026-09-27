from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.tenant_context import TenantContext
from app.core.security import decode_token

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        TenantContext.clear()
        
        # 1. Extract tenant headers if explicitly provided (e.g. multi-tenant routing, custom domain)
        header_tenant_id = request.headers.get("X-Tenant-ID")
        header_org_id = request.headers.get("X-Org-ID")
        header_branch_id = request.headers.get("X-Branch-ID")
        
        # 2. Extract Authorization Bearer token if present
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = decode_token(token)
                tenant_id = payload.get("tenant_id") or header_tenant_id
                org_id = payload.get("org_id") or header_org_id
                branch_id = payload.get("branch_id") or header_branch_id
                
                TenantContext.set_tenant_id(tenant_id)
                TenantContext.set_org_id(org_id)
                TenantContext.set_branch_id(branch_id)
                TenantContext.set_current_user({
                    "id": payload.get("sub"),
                    "role": payload.get("role"),
                    "permissions": payload.get("permissions", []),
                    "tenant_id": tenant_id,
                    "org_id": org_id,
                    "branch_id": branch_id
                })
            except Exception:
                # If token is invalid or expired, proceed so auth dependencies can handle it
                pass
        else:
            if header_tenant_id:
                TenantContext.set_tenant_id(header_tenant_id)
            if header_org_id:
                TenantContext.set_org_id(header_org_id)
            if header_branch_id:
                TenantContext.set_branch_id(header_branch_id)

        response = await call_next(request)
        TenantContext.clear()
        return response
