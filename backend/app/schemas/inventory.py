from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.recipe import RecipeIngredient

class IngredientCreate(BaseModel):
    name: str
    code: str
    category: str
    unit: str
    current_stock: float = 0.0
    minimum_stock: float = 10.0
    maximum_stock: float = 100.0
    unit_cost: float = 0.0
    storage_location: Optional[str] = "Main Pantry"
    is_perishable: bool = True
    expiry_days: int = 7
    preferred_vendor_id: Optional[str] = None

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    current_stock: Optional[float] = None
    minimum_stock: Optional[float] = None
    maximum_stock: Optional[float] = None
    unit_cost: Optional[float] = None
    storage_location: Optional[str] = None
    is_perishable: Optional[bool] = None
    expiry_days: Optional[int] = None
    preferred_vendor_id: Optional[str] = None

class StockAdjustmentRequest(BaseModel):
    ingredient_id: str
    quantity: float
    transaction_type: str # stock_in, stock_out, adjustment
    unit_cost: Optional[float] = None
    notes: Optional[str] = None

class WastageCreateRequest(BaseModel):
    ingredient_id: str
    quantity: float
    reason: str
    notes: Optional[str] = None

class BulkStockInItem(BaseModel):
    ingredient_id: str
    quantity: float
    unit_cost: Optional[float] = None
    notes: Optional[str] = None

class BulkStockInRequest(BaseModel):
    items: List[BulkStockInItem]
    vendor_id: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class RecipeCreateRequest(BaseModel):
    product_id: str
    yield_servings: int = 1
    ingredients: List[RecipeIngredient]
    selling_price: float
    instructions: Optional[str] = None

