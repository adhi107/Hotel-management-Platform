from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.base import BaseDocument, TenantDocument

class FeatureFlags(BaseModel):
    quick_sale: bool = True
    counter_mode: bool = True
    pos: bool = True
    tables: bool = True
    floor_plan: bool = True
    kitchen_display: bool = True
    qr_ordering: bool = True
    online_ordering: bool = True
    reservations: bool = True
    delivery: bool = True
    simple_inventory: bool = True
    advanced_inventory: bool = True
    recipes: bool = True
    food_costing: bool = True
    procurement: bool = True
    crm: bool = True
    loyalty: bool = True
    khata_credit: bool = True
    day_close: bool = True
    expenses: bool = True
    employees: bool = True
    payroll: bool = True
    advanced_analytics: bool = True
    ai_features: bool = True
    catering: bool = False
    multi_branch: bool = True
    multi_brand: bool = True

class WhiteLabelConfig(BaseModel):
    restaurant_name: str = "Aura Fresh Juices & Cafe"
    tagline: str = "Fresh • Pure • Fast"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: str = "#3B82F6"
    secondary_color: str = "#8B5CF6"
    accent_color: str = "#10B981"
    dark_mode: bool = True
    currency: str = "INR"
    currency_symbol: str = "₹"
    decimal_precision: int = 2
    date_format: str = "DD/MM/YYYY"
    time_format: str = "12h"
    timezone: str = "Asia/Kolkata"
    invoice_header: str = "Thank you for visiting!"
    invoice_footer: str = "UPI / PhonePe / GPay Accepted"
    gst_number: Optional[str] = ""
    service_charge_percent: float = 0.0
    tax_percent: float = 0.0

BUSINESS_TEMPLATES = {
    "Juice Center": {
        "ui_mode": "simple",
        "business_size": "micro",
        "features": {
            "quick_sale": True,
            "counter_mode": True,
            "pos": False,
            "tables": False,
            "floor_plan": False,
            "kitchen_display": False,
            "qr_ordering": False,
            "online_ordering": False,
            "reservations": False,
            "delivery": False,
            "simple_inventory": True,
            "advanced_inventory": False,
            "recipes": False,
            "food_costing": False,
            "procurement": False,
            "crm": True,
            "loyalty": False,
            "khata_credit": True,
            "day_close": True,
            "expenses": True,
            "employees": False,
            "advanced_analytics": False,
            "ai_features": True
        }
    },
    "Tea Shop": {
        "ui_mode": "simple",
        "business_size": "micro",
        "features": {
            "quick_sale": True,
            "counter_mode": True,
            "pos": False,
            "tables": False,
            "floor_plan": False,
            "kitchen_display": False,
            "qr_ordering": False,
            "online_ordering": False,
            "reservations": False,
            "delivery": False,
            "simple_inventory": True,
            "advanced_inventory": False,
            "recipes": False,
            "food_costing": False,
            "procurement": False,
            "crm": True,
            "loyalty": False,
            "khata_credit": True,
            "day_close": True,
            "expenses": True,
            "employees": False,
            "advanced_analytics": False,
            "ai_features": True
        }
    },
    "Food Stall": {
        "ui_mode": "simple",
        "business_size": "micro",
        "features": {
            "quick_sale": True,
            "counter_mode": True,
            "pos": False,
            "tables": False,
            "floor_plan": False,
            "kitchen_display": False,
            "qr_ordering": False,
            "online_ordering": False,
            "reservations": False,
            "delivery": False,
            "simple_inventory": True,
            "advanced_inventory": False,
            "recipes": False,
            "food_costing": False,
            "procurement": False,
            "crm": True,
            "loyalty": False,
            "khata_credit": True,
            "day_close": True,
            "expenses": True,
            "employees": False,
            "advanced_analytics": False,
            "ai_features": True
        }
    },
    "Bakery": {
        "ui_mode": "standard",
        "business_size": "small",
        "features": {
            "quick_sale": True,
            "counter_mode": True,
            "pos": True,
            "tables": False,
            "floor_plan": False,
            "kitchen_display": False,
            "qr_ordering": False,
            "online_ordering": True,
            "reservations": False,
            "delivery": True,
            "simple_inventory": False,
            "advanced_inventory": True,
            "recipes": True,
            "food_costing": True,
            "procurement": True,
            "crm": True,
            "loyalty": True,
            "khata_credit": True,
            "day_close": True,
            "expenses": True,
            "employees": True,
            "advanced_analytics": True,
            "ai_features": True
        }
    },
    "Cafe": {
        "ui_mode": "standard",
        "business_size": "small",
        "features": {
            "quick_sale": True,
            "counter_mode": True,
            "pos": True,
            "tables": True,
            "floor_plan": True,
            "kitchen_display": True,
            "qr_ordering": True,
            "online_ordering": True,
            "reservations": False,
            "delivery": True,
            "simple_inventory": False,
            "advanced_inventory": True,
            "recipes": True,
            "food_costing": True,
            "procurement": True,
            "crm": True,
            "loyalty": True,
            "khata_credit": False,
            "day_close": True,
            "expenses": True,
            "employees": True,
            "advanced_analytics": True,
            "ai_features": True
        }
    },
    "Cloud Kitchen": {
        "ui_mode": "standard",
        "business_size": "small",
        "features": {
            "quick_sale": False,
            "counter_mode": False,
            "pos": True,
            "tables": False,
            "floor_plan": False,
            "kitchen_display": True,
            "qr_ordering": False,
            "online_ordering": True,
            "reservations": False,
            "delivery": True,
            "simple_inventory": False,
            "advanced_inventory": True,
            "recipes": True,
            "food_costing": True,
            "procurement": True,
            "crm": True,
            "loyalty": False,
            "khata_credit": False,
            "day_close": True,
            "expenses": True,
            "employees": True,
            "advanced_analytics": True,
            "ai_features": True
        }
    },
    "Restaurant": {
        "ui_mode": "advanced",
        "business_size": "medium",
        "features": {
            "quick_sale": True,
            "counter_mode": True,
            "pos": True,
            "tables": True,
            "floor_plan": True,
            "kitchen_display": True,
            "qr_ordering": True,
            "online_ordering": True,
            "reservations": True,
            "delivery": True,
            "simple_inventory": False,
            "advanced_inventory": True,
            "recipes": True,
            "food_costing": True,
            "procurement": True,
            "crm": True,
            "loyalty": True,
            "khata_credit": True,
            "day_close": True,
            "expenses": True,
            "employees": True,
            "advanced_analytics": True,
            "ai_features": True,
            "multi_branch": True,
            "multi_brand": True
        }
    },
    "Catering": {
        "ui_mode": "standard",
        "business_size": "small",
        "features": {
            "quick_sale": False,
            "counter_mode": False,
            "pos": True,
            "tables": False,
            "floor_plan": False,
            "kitchen_display": False,
            "qr_ordering": False,
            "online_ordering": False,
            "reservations": False,
            "delivery": False,
            "simple_inventory": False,
            "advanced_inventory": True,
            "recipes": True,
            "food_costing": True,
            "procurement": True,
            "crm": True,
            "loyalty": False,
            "khata_credit": True,
            "day_close": True,
            "expenses": True,
            "employees": True,
            "advanced_analytics": True,
            "ai_features": True,
            "catering": True
        }
    }
}

class Tenant(BaseDocument):
    name: str
    slug: str
    owner_email: str
    phone: Optional[str] = None
    business_type: str = "Restaurant" # Restaurant, Cafe, Juice Center, Tea Shop, Coffee Shop, Bakery, Sweet Shop, Ice Cream Shop, Tiffin Center, Fast Food, QSR, Food Stall, Food Truck, Cloud Kitchen, Home Kitchen, Catering, Food Court, Bar, Dessert Shop, Snack Shop, Multi-Brand Kitchen, Custom
    business_size: str = "small" # solo, micro, small, medium, large, enterprise
    ui_mode: str = "standard" # simple, standard, advanced
    plan: str = "enterprise" # starter, professional, business, enterprise
    is_active: bool = True
    subscription_end_date: Optional[str] = None
    features: FeatureFlags = Field(default_factory=FeatureFlags)
    config: WhiteLabelConfig = Field(default_factory=WhiteLabelConfig)

class Organization(BaseDocument):
    tenant_id: str
    name: str
    legal_name: Optional[str] = None
    country: str = "India"
    tax_id: Optional[str] = None

class Brand(TenantDocument):
    name: str
    description: Optional[str] = None
    cuisine_type: List[str] = Field(default_factory=list)
    logo_url: Optional[str] = None

class Branch(TenantDocument):
    name: str
    code: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: Optional[str] = None
    is_active: bool = True
    opening_time: str = "11:00"
    closing_time: str = "23:30"
    table_count: int = 24
