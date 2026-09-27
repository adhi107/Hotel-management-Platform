from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import logging
from app.core.exceptions import AppException

logger = logging.getLogger("aura.errors")

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except AppException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "error": {
                        "code": exc.code,
                        "message": exc.message,
                        "details": exc.details
                    }
                }
            )
        except Exception as exc:
            logger.exception(f"Unhandled server error on {request.method} {request.url.path}: {exc}")
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred. Please try again or contact support.",
                        "details": {"error": str(exc)}
                    }
                }
            )
