from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, List, Dict, Any

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "Success"
    meta: Optional[Dict[str, Any]] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class APIErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 50
    search: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[int] = -1 # -1 for desc, 1 for asc
