from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.menu import VariantOption, ModifierOption

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Utensils"
    sort_order: int = 0
    parent_id: Optional[str] = None

class ProductCreate(BaseModel):
    category_id: str
    name: str
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
    spice_level: int = 1
    calories: Optional[int] = None
    prep_time_minutes: int = 15
    kitchen_station: str = "Kitchen"
    variants: List[VariantOption] = Field(default_factory=list)
    modifier_group_ids: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)
    available_schedules: List[str] = Field(default_factory=lambda: ["Breakfast", "Lunch", "Dinner", "All Day"])

class ProductUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    cost_price: Optional[float] = None
    tax_rate: Optional[float] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_vegetarian: Optional[bool] = None
    spice_level: Optional[int] = None
    prep_time_minutes: Optional[int] = None
    kitchen_station: Optional[str] = None

class ModifierGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    min_selection: int = 0
    max_selection: int = 1
    options: List[ModifierOption] = Field(default_factory=list)
