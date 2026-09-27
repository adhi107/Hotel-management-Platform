from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
import logging
from datetime import datetime, timezone
from app.core.tenant_context import TenantContext
from app.core.database import get_database

logger = logging.getLogger("aura.audit")

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        response = await call_next(request)
        process_time = round((time.time() - start_time) * 1000, 2)
        
        # We record audit entries for mutating requests (POST, PUT, PATCH, DELETE) on API endpoints
        if request.method in ["POST", "PUT", "PATCH", "DELETE"] and request.url.path.startswith("/api/v1/"):
            try:
                user = TenantContext.get_current_user()
                tenant_id = TenantContext.get_tenant_id()
                org_id = TenantContext.get_org_id()
                branch_id = TenantContext.get_branch_id()
                
                audit_record = {
                    "tenant_id": tenant_id,
                    "organization_id": org_id,
                    "branch_id": branch_id,
                    "user_id": user.get("id") if user else None,
                    "user_role": user.get("role") if user else None,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "ip_address": client_ip,
                    "user_agent": user_agent,
                    "duration_ms": process_time,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                
                db = get_database()
                if db is not None:
                    # Non-blocking async insert
                    import asyncio
                    asyncio.create_task(db["audit_logs"].insert_one(audit_record))
            except Exception as e:
                logger.debug(f"Audit log writing failed silently: {e}")

        response.headers["X-Process-Time"] = f"{process_time}ms"
        return response
