from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.base import TenantDocument

class ModifierOption(BaseModel):
    id: str
    name: str
    price: float = 0.0
    is_default: bool = False

class ModifierGroup(TenantDocument):
    name: str
    description: Optional[str] = None
    min_selection: int = 0
    max_selection: int = 1
    options: List[ModifierOption] = Field(default_factory=list)

class VariantOption(BaseModel):
    id: str
    name: str
    sku: Optional[str] = None
    price: float
    cost_price: float = 0.0

class Category(TenantDocument):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True
    parent_id: Optional[str] = None

class Product(TenantDocument):
    category_id: str
    name: str
    slug: str
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    base_price: float
    cost_price: float = 0.0
    tax_rate: float = 5.0
    image_url: Optional[str] = None
    is_available: bool = True
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_gluten_free: bool = False
    is_jain: bool = False
    spice_level: int = 1 # 0 to 3
    calories: Optional[int] = None
    prep_time_minutes: int = 15
    kitchen_station: str = "Kitchen" # Kitchen, Grill, Bar, Bakery, Packaging
    variants: List[VariantOption] = Field(default_factory=list)
    modifier_group_ids: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)
    available_schedules: List[str] = Field(default_factory=lambda: ["Breakfast", "Lunch", "Dinner", "All Day"])
    recipe_id: Optional[str] = None
