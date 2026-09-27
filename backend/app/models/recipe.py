from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.base import TenantDocument

class RecipeIngredient(BaseModel):
    ingredient_id: str
    ingredient_name: str
    quantity: float
    unit: str
    unit_cost: float
    total_cost: float

class Recipe(TenantDocument):
    product_id: str
    product_name: str
    yield_servings: int = 1
    ingredients: List[RecipeIngredient] = Field(default_factory=list)
    total_food_cost: float = 0.0
    selling_price: float = 0.0
    food_cost_percentage: float = 0.0 # (total_food_cost / selling_price) * 100
    gross_margin_amount: float = 0.0
    gross_margin_percentage: float = 0.0
    instructions: Optional[str] = None
    version: int = 1
    is_active: bool = True
