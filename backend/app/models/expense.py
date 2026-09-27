from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class ExpenseCategory(TenantDocument):
    name: str # Rent, Utilities, Salaries, Maintenance, Marketing, Supplies, Waste
    description: Optional[str] = None
    monthly_budget: float = 0.0

class Expense(TenantDocument):
    category_id: str
    category_name: str
    title: str
    amount: float
    expense_date: str
    payment_mode: str = "Bank Transfer" # Cash, Card, UPI, Bank Transfer
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None
    invoice_url: Optional[str] = None
    status: str = "approved" # pending, approved, rejected
    approved_by: Optional[str] = None
    notes: Optional[str] = None
