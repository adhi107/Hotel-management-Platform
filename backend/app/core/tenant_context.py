from contextvars import ContextVar
from typing import Optional, Dict, Any

_tenant_id_ctx: ContextVar[Optional[str]] = ContextVar("tenant_id_ctx", default=None)
_org_id_ctx: ContextVar[Optional[str]] = ContextVar("org_id_ctx", default=None)
_branch_id_ctx: ContextVar[Optional[str]] = ContextVar("branch_id_ctx", default=None)
_user_ctx: ContextVar[Optional[Dict[str, Any]]] = ContextVar("user_ctx", default=None)

class TenantContext:
    @staticmethod
    def get_tenant_id() -> Optional[str]:
        return _tenant_id_ctx.get()

    @staticmethod
    def set_tenant_id(tenant_id: Optional[str]) -> None:
        _tenant_id_ctx.set(tenant_id)

    @staticmethod
    def get_org_id() -> Optional[str]:
        return _org_id_ctx.get()

    @staticmethod
    def set_org_id(org_id: Optional[str]) -> None:
        _org_id_ctx.set(org_id)

    @staticmethod
    def get_branch_id() -> Optional[str]:
        return _branch_id_ctx.get()

    @staticmethod
    def set_branch_id(branch_id: Optional[str]) -> None:
        _branch_id_ctx.set(branch_id)

    @staticmethod
    def get_current_user() -> Optional[Dict[str, Any]]:
        return _user_ctx.get()

    @staticmethod
    def set_current_user(user: Optional[Dict[str, Any]]) -> None:
        _user_ctx.set(user)

    @staticmethod
    def clear() -> None:
        _tenant_id_ctx.set(None)
        _org_id_ctx.set(None)
        _branch_id_ctx.set(None)
        _user_ctx.set(None)
