from fastapi import HTTPException, status
from typing import Optional, Any, Dict

class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status_code, 
            detail={
                "code": code,
                "message": message,
                "details": details or {}
            }
        )
        self.code = code
        self.message = message
        self.details = details or {}

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Invalid authentication credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message
        )

class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message
        )

class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", identifier: Optional[str] = None):
        msg = f"{resource} not found"
        if identifier:
            msg += f" (ID: {identifier})"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=msg
        )

class BadRequestException(AppException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="BAD_REQUEST",
            message=message,
            details=details
        )

class TenantIsolationException(AppException):
    def __init__(self, message: str = "Tenant context violation"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="TENANT_ISOLATION_VIOLATION",
            message=message
        )
