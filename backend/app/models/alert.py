from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.models.base import TenantDocument

class Alert(TenantDocument):
    alert_type: str # low_inventory, expiring_stock, abnormal_refund, kitchen_sla_delay, unusual_sales_drop, high_wastage, cash_discrepancy
    severity: str = "warning" # info, warning, critical
    title: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    is_resolved: bool = False
    resolved_at: Optional[str] = None
    resolved_by: Optional[str] = None

class Notification(TenantDocument):
    user_id: Optional[str] = None # None means all branch staff
    channel: str = "in_app" # in_app, email, sms, whatsapp
    title: str
    message: str
    link_url: Optional[str] = None
    is_read: bool = False
