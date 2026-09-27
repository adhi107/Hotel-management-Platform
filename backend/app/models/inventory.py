from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class Ingredient(TenantDocument):
    name: str
    code: str
    category: str # Dairy, Produce, Meat, Spices, Bakery, Beverages, Packaging
    unit: str # kg, g, l, ml, pcs, packet
    current_stock: float = 0.0
    minimum_stock: float = 10.0 # reorder level
    maximum_stock: float = 100.0
    unit_cost: float = 0.0
    storage_location: Optional[str] = "Main Pantry"
    is_perishable: bool = True
    expiry_days: int = 7
    preferred_vendor_id: Optional[str] = None

class InventoryTransaction(TenantDocument):
    ingredient_id: str
    ingredient_name: str
    transaction_type: str # stock_in, stock_out, recipe_deduction, wastage, transfer, adjustment
    quantity: float
    unit: str
    unit_cost: float
    total_cost: float
    reference_id: Optional[str] = None # Order ID, PO ID, or Wastage ID
    notes: Optional[str] = None

class Wastage(TenantDocument):
    ingredient_id: str
    ingredient_name: str
    quantity: float
    unit: str
    cost_amount: float
    reason: str # expired, damaged, burnt, over_prepped, spillage
    recorded_by: Optional[str] = None
