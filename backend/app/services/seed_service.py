import uuid
import random
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from app.core.database import get_collection, get_database
from app.core.security import get_password_hash
import logging

logger = logging.getLogger("aura.seed")

class SeedService:
    @staticmethod
    async def seed_enterprise_data() -> Dict[str, Any]:
        db = get_database()
        if db is None:
            return {"status": "error", "message": "Database not available"}

        logger.info("Starting comprehensive realistic enterprise seed data generation...")

        # 1. Organization & Tenant
        tenant_id = "tenant-aura-enterprise-001"
        org_id = "org-aura-hospitality-001"
        
        # Check if already seeded
        existing = await db["tenants"].find_one({"id": tenant_id})
        if existing:
            # Ensure recipes exist
            rec_count = await db["recipes"].count_documents({"tenant_id": tenant_id})
            if rec_count == 0:
                branch_1_id = "branch-indiranagar-flagship"
                recipes_data = [
                    {
                        "_id": "rec-hyderabadi-biryani",
                        "id": "rec-hyderabadi-biryani",
                        "tenant_id": tenant_id,
                        "branch_id": branch_1_id,
                        "product_id": "p-hyderabadi-biryani",
                        "product_name": "Royal Hyderabadi Dum Biryani (Chicken)",
                        "yield_servings": 1,
                        "ingredients": [
                            {"ingredient_id": "ing-chicken", "ingredient_name": "Fresh Chicken Breast (Boneless)", "quantity": 0.25, "unit": "kg", "unit_cost": 100.0, "total_cost": 25.0},
                            {"ingredient_id": "ing-basmati", "ingredient_name": "Royal Aged Basmati Rice", "quantity": 0.20, "unit": "kg", "unit_cost": 30.0, "total_cost": 6.0},
                            {"ingredient_id": "ing-ghee", "ingredient_name": "A2 Desi Cow Ghee", "quantity": 0.03, "unit": "kg", "unit_cost": 60.0, "total_cost": 1.8},
                            {"ingredient_id": "ing-onions", "ingredient_name": "Fresh Red Onions", "quantity": 0.10, "unit": "kg", "unit_cost": 30.0, "total_cost": 3.0},
                        ],
                        "total_food_cost": 35.8,
                        "selling_price": 390.0,
                        "food_cost_percentage": 9.18,
                        "gross_margin_amount": 354.2,
                        "gross_margin_percentage": 90.82,
                        "instructions": "Slow cooked sealed dum with aged saffron and basmati",
                        "version": 1,
                        "is_active": True,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "_id": "rec-paneer-biryani",
                        "id": "rec-paneer-biryani",
                        "tenant_id": tenant_id,
                        "branch_id": branch_1_id,
                        "product_id": "p-paneer-biryani",
                        "product_name": "Dum Pukht Subz Paneer Biryani",
                        "yield_servings": 1,
                        "ingredients": [
                            {"ingredient_id": "ing-paneer", "ingredient_name": "Fresh Malai Cottage Cheese (Paneer)", "quantity": 0.18, "unit": "kg", "unit_cost": 80.0, "total_cost": 14.4},
                            {"ingredient_id": "ing-basmati", "ingredient_name": "Royal Aged Basmati Rice", "quantity": 0.20, "unit": "kg", "unit_cost": 30.0, "total_cost": 6.0},
                            {"ingredient_id": "ing-ghee", "ingredient_name": "A2 Desi Cow Ghee", "quantity": 0.03, "unit": "kg", "unit_cost": 60.0, "total_cost": 1.8},
                        ],
                        "total_food_cost": 22.2,
                        "selling_price": 320.0,
                        "food_cost_percentage": 6.94,
                        "gross_margin_amount": 297.8,
                        "gross_margin_percentage": 93.06,
                        "instructions": "Marinated malai paneer cubes layered with aromatic spices",
                        "version": 1,
                        "is_active": True,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "_id": "rec-margherita",
                        "id": "rec-margherita",
                        "tenant_id": tenant_id,
                        "branch_id": branch_1_id,
                        "product_id": "p-margherita",
                        "product_name": "Neapolitan Margherita Pizza (12\")",
                        "yield_servings": 1,
                        "ingredients": [
                            {"ingredient_id": "ing-flour", "ingredient_name": "Neapolitan '00' Sourdough Flour", "quantity": 0.22, "unit": "kg", "unit_cost": 20.0, "total_cost": 4.4},
                            {"ingredient_id": "ing-mozzarella", "ingredient_name": "Fresh Buffalo Mozzarella Cheese", "quantity": 0.15, "unit": "kg", "unit_cost": 60.0, "total_cost": 9.0},
                            {"ingredient_id": "ing-tomatoes", "ingredient_name": "Fresh Vine Ripe Tomatoes", "quantity": 0.12, "unit": "kg", "unit_cost": 25.0, "total_cost": 3.0},
                        ],
                        "total_food_cost": 16.4,
                        "selling_price": 380.0,
                        "food_cost_percentage": 4.32,
                        "gross_margin_amount": 363.6,
                        "gross_margin_percentage": 95.68,
                        "instructions": "Wood-fired at 450C for 90 seconds",
                        "version": 1,
                        "is_active": True,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "_id": "rec-cappuccino",
                        "id": "rec-cappuccino",
                        "tenant_id": tenant_id,
                        "branch_id": branch_1_id,
                        "product_id": "p-cappuccino",
                        "product_name": "Classic Italian Cappuccino",
                        "yield_servings": 1,
                        "ingredients": [
                            {"ingredient_id": "ing-coffee", "ingredient_name": "Specialty Arabica Roasted Beans", "quantity": 0.02, "unit": "kg", "unit_cost": 50.0, "total_cost": 1.0},
                            {"ingredient_id": "ing-milk", "ingredient_name": "Farm Fresh Full Cream Milk", "quantity": 0.18, "unit": "l", "unit_cost": 40.0, "total_cost": 7.2},
                        ],
                        "total_food_cost": 8.2,
                        "selling_price": 160.0,
                        "food_cost_percentage": 5.12,
                        "gross_margin_amount": 151.8,
                        "gross_margin_percentage": 94.88,
                        "instructions": "18g double shot Arabica espresso with micro-textured velvety milk foam",
                        "version": 1,
                        "is_active": True,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "_id": "rec-mango-shake",
                        "id": "rec-mango-shake",
                        "tenant_id": tenant_id,
                        "branch_id": branch_1_id,
                        "product_id": "p-mango-shake",
                        "product_name": "Thick Mango Malai Shake",
                        "yield_servings": 1,
                        "ingredients": [
                            {"ingredient_id": "ing-mango", "ingredient_name": "Alphonso Mango Pulp", "quantity": 0.15, "unit": "kg", "unit_cost": 120.0, "total_cost": 18.0},
                            {"ingredient_id": "ing-milk", "ingredient_name": "Farm Fresh Full Cream Milk", "quantity": 0.20, "unit": "l", "unit_cost": 40.0, "total_cost": 8.0},
                            {"ingredient_id": "ing-sugar", "ingredient_name": "Organic Cane Sugar", "quantity": 0.02, "unit": "kg", "unit_cost": 25.0, "total_cost": 0.5},
                        ],
                        "total_food_cost": 26.5,
                        "selling_price": 160.0,
                        "food_cost_percentage": 16.56,
                        "gross_margin_amount": 133.5,
                        "gross_margin_percentage": 83.44,
                        "instructions": "Blended with pure Alphonso pulp and chilled rich milk",
                        "version": 1,
                        "is_active": True,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                ]
                await db["recipes"].insert_many(recipes_data)
            return {"status": "success", "message": "Data already seeded", "tenant_id": tenant_id}

        tenant_doc = {
            "_id": tenant_id,
            "id": tenant_id,
            "name": "Aura Hospitality Group",
            "slug": "aura-hospitality",
            "owner_email": "owner@aura.io",
            "phone": "+91 98765 43210",
            "business_type": "Restaurant",
            "business_size": "enterprise",
            "ui_mode": "advanced",
            "plan": "enterprise",
            "is_active": True,
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
                "simple_inventory": True,
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
                "payroll": True,
                "advanced_analytics": True,
                "ai_features": True,
                "multi_branch": True,
                "multi_brand": True
            },
            "config": {
                "restaurant_name": "Aura Grand & FreshPress Co.",
                "tagline": "Curated Hospitality & Fresh Flavors",
                "primary_color": "#3B82F6",
                "secondary_color": "#8B5CF6",
                "accent_color": "#10B981",
                "dark_mode": True,
                "currency": "INR",
                "currency_symbol": "₹",
                "decimal_precision": 2,
                "tax_percent": 5.0,
                "service_charge_percent": 5.0
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db["tenants"].insert_one(tenant_doc)

        # 2. Brands & Branches
        brand_1_id = "brand-aura-finedine"
        brand_2_id = "brand-freshpress-juice"

        await db["brands"].insert_many([
            {
                "_id": brand_1_id,
                "id": brand_1_id,
                "tenant_id": tenant_id,
                "name": "Aura Bistro & Fine Dining",
                "description": "Modern Continental & North Indian Bistro",
                "cuisine_type": ["North Indian", "Continental", "Italian"],
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": brand_2_id,
                "id": brand_2_id,
                "tenant_id": tenant_id,
                "name": "FreshPress Juices & Tiffins",
                "description": "Artisan Cold-Pressed Juices, Tea & Quick Bites",
                "cuisine_type": ["Juices", "Beverages", "South Indian", "Snacks"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ])

        branch_1_id = "branch-hitec-city"
        branch_2_id = "branch-jubilee-hills"
        branch_3_id = "branch-gachibowli"

        branches = [
            {
                "_id": branch_1_id,
                "id": branch_1_id,
                "tenant_id": tenant_id,
                "organization_id": org_id,
                "brand_id": brand_1_id,
                "name": "Aura Bistro - Hitec City (Flagship)",
                "code": "AURA-HTC-01",
                "address": "Level 4, Skyview Corporate Towers, Hitec City",
                "city": "Hyderabad",
                "state": "Telangana",
                "pincode": "500081",
                "phone": "+91 40 2345 6789",
                "is_active": True,
                "table_count": 24,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": branch_2_id,
                "id": branch_2_id,
                "tenant_id": tenant_id,
                "organization_id": org_id,
                "brand_id": brand_1_id,
                "name": "Aura Cafe - Jubilee Hills",
                "code": "AURA-JBL-02",
                "address": "Road No. 36, Jubilee Hills",
                "city": "Hyderabad",
                "state": "Telangana",
                "pincode": "500033",
                "phone": "+91 40 2345 8890",
                "is_active": True,
                "table_count": 16,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": branch_3_id,
                "id": branch_3_id,
                "tenant_id": tenant_id,
                "organization_id": org_id,
                "brand_id": brand_2_id,
                "name": "FreshPress - Gachibowli QSR",
                "code": "FP-GB-01",
                "address": "Financial District Main Rd, Gachibowli",
                "city": "Hyderabad",
                "state": "Telangana",
                "pincode": "500032",
                "phone": "+91 40 2345 9911",
                "is_active": True,
                "table_count": 8,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db["branches"].insert_many(branches)

        # 3. Roles & Users
        pwd_hash = get_password_hash("password123")
        users = [
            {
                "_id": "user-super-admin",
                "id": "user-super-admin",
                "tenant_id": tenant_id,
                "email": "admin@aura.io",
                "hashed_password": pwd_hash,
                "full_name": "Antigravity Super Admin",
                "role": "super_admin",
                "is_super_admin": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "user-owner",
                "id": "user-owner",
                "tenant_id": tenant_id,
                "organization_id": org_id,
                "branch_id": branch_1_id,
                "email": "owner@aura.io",
                "hashed_password": pwd_hash,
                "full_name": "Rajeev Sharma (Owner)",
                "role": "organization_owner",
                "assigned_branch_ids": [branch_1_id, branch_2_id, branch_3_id],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "user-manager",
                "id": "user-manager",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "email": "manager@aura.io",
                "hashed_password": pwd_hash,
                "full_name": "Priya Reddy (Branch Manager)",
                "role": "branch_manager",
                "assigned_branch_ids": [branch_1_id],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "user-cashier",
                "id": "user-cashier",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "email": "cashier@aura.io",
                "hashed_password": pwd_hash,
                "full_name": "Vikram Sen (POS Cashier)",
                "role": "cashier",
                "assigned_branch_ids": [branch_1_id],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "user-chef",
                "id": "user-chef",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "email": "chef@aura.io",
                "hashed_password": pwd_hash,
                "full_name": "Sanjeev Verma (Executive Chef)",
                "role": "chef",
                "assigned_branch_ids": [branch_1_id],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "user-waiter",
                "id": "user-waiter",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "email": "waiter@aura.io",
                "hashed_password": pwd_hash,
                "full_name": "Rahul Das (Captain)",
                "role": "waiter",
                "assigned_branch_ids": [branch_1_id],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "user-inventory",
                "id": "user-inventory",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "email": "inventory@aura.io",
                "hashed_password": pwd_hash,
                "full_name": "Ananya Roy (Inventory Lead)",
                "role": "inventory_manager",
                "assigned_branch_ids": [branch_1_id, branch_2_id],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db["users"].insert_many(users)

        # 4. Floors, Sections & Tables
        floor_id = "floor-ground"
        section_main = "section-ac-dining"
        section_patio = "section-outdoor-patio"
        section_lounge = "section-bar-lounge"

        await db["floors"].insert_one({
            "_id": floor_id,
            "id": floor_id,
            "tenant_id": tenant_id,
            "branch_id": branch_1_id,
            "name": "Ground Level Main Hall",
            "level": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        await db["sections"].insert_many([
            {"_id": section_main, "id": section_main, "tenant_id": tenant_id, "branch_id": branch_1_id, "floor_id": floor_id, "name": "AC Main Dining", "color_code": "#3B82F6", "created_at": datetime.now(timezone.utc).isoformat()},
            {"_id": section_patio, "id": section_patio, "tenant_id": tenant_id, "branch_id": branch_1_id, "floor_id": floor_id, "name": "Rooftop Garden Patio", "color_code": "#10B981", "created_at": datetime.now(timezone.utc).isoformat()},
            {"_id": section_lounge, "id": section_lounge, "tenant_id": tenant_id, "branch_id": branch_1_id, "floor_id": floor_id, "name": "Cocktail & Tapas Lounge", "color_code": "#8B5CF6", "created_at": datetime.now(timezone.utc).isoformat()}
        ])

        tables_data = []
        for i in range(1, 13):
            status = "occupied" if i in [2, 5, 8] else ("billing" if i == 4 else ("reserved" if i == 7 else "available"))
            sec = section_main if i <= 6 else (section_patio if i <= 9 else section_lounge)
            tables_data.append({
                "_id": f"table-t{i:02d}",
                "id": f"table-t{i:02d}",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "floor_id": floor_id,
                "section_id": sec,
                "table_number": f"T-{i:02d}",
                "capacity": 2 if i % 3 == 0 else (6 if i % 4 == 0 else 4),
                "shape": "round" if i % 2 == 0 else "square",
                "status": status,
                "pos_x": 80 + ((i - 1) % 4) * 160,
                "pos_y": 60 + ((i - 1) // 4) * 130,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        await db["tables"].insert_many(tables_data)

        # 5. Categories & 100 Products
        raw_cats = [
            ("cat-juices", "Fresh Cold-Pressed Juices", "GlassWater", 1),
            ("cat-smoothies", "Artisan Smoothies & Shakes", "Coffee", 2),
            ("cat-hot-chai", "Signature Tea & Irani Chai", "CupSoda", 3),
            ("cat-coffees", "Specialty Espresso & Brews", "Coffee", 4),
            ("cat-breakfast", "South Indian Tiffins & Dosa", "Utensils", 5),
            ("cat-tandoor", "Tandoori Kebabs & Starters", "Flame", 6),
            ("cat-pizzas", "Artisan Sourdough Pizzas", "Pizza", 7),
            ("cat-burgers", "Gourmet Burgers & Sliders", "Sandwich", 8),
            ("cat-biryani", "Hyderabadi Dum Biryani & Bowls", "Soup", 9),
            ("cat-desserts", "Craft Desserts & Gelato", "Cake", 10),
        ]
        cats_to_insert = [
            {"_id": c[0], "id": c[0], "tenant_id": tenant_id, "name": c[1], "slug": c[1].lower().replace(" ", "-"), "icon": c[2], "sort_order": c[3], "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()}
            for c in raw_cats
        ]
        await db["categories"].insert_many(cats_to_insert)

        products_data = [
            # Juices (cat-juices)
            ("p-mango", "cat-juices", "Fresh Alphonso Mango Juice", 120.0, 35.0, True, True, 0, "Bar", ["100% Pure", "Seasonal"]),
            ("p-orange", "cat-juices", "Valencia Orange Cold Pressed", 110.0, 30.0, True, True, 0, "Bar", ["Vitamin C"]),
            ("p-water", "cat-juices", "Fresh Watermelon Mint Juice", 90.0, 20.0, True, True, 0, "Bar", ["Hydrating"]),
            ("p-pome", "cat-juices", "Ruby Pomegranate Elixir", 140.0, 45.0, True, True, 0, "Bar", ["Antioxidant"]),
            ("p-green", "cat-juices", "Detox Green (Spinach, Cucumber, Green Apple)", 130.0, 38.0, True, True, 0, "Bar", ["Detox"]),
            ("p-sugarcane", "cat-juices", "Fresh Sugarcane with Ginger & Lemon", 70.0, 15.0, True, True, 0, "Bar", ["Natural"]),
            ("p-mosambi", "cat-juices", "Sweet Lime / Mosambi Cooler", 90.0, 22.0, True, True, 0, "Bar", ["Pure Juice"]),
            ("p-pineapple", "cat-juices", "Queen Pineapple Juice", 100.0, 25.0, True, True, 0, "Bar", ["Fresh"]),

            # Smoothies (cat-smoothies)
            ("p-berry-smoothie", "cat-smoothies", "Wild Berry Greek Yogurt Smoothie", 180.0, 55.0, True, False, 0, "Bar", ["Protein Rich"]),
            ("p-mango-shake", "cat-smoothies", "Thick Mango Malai Shake", 160.0, 48.0, True, False, 0, "Bar", ["Best Seller"]),
            ("p-avocado-shake", "cat-smoothies", "Hass Avocado Honey Smoothie", 220.0, 75.0, True, False, 0, "Bar", ["Superfood"]),
            ("p-belgian-shake", "cat-smoothies", "Belgian Dark Chocolate Thickshake", 190.0, 60.0, True, False, 0, "Bar", ["Indulgent"]),

            # Tea & Chai (cat-hot-chai)
            ("p-irani-chai", "cat-hot-chai", "Special Hyderabadi Irani Chai", 35.0, 8.0, True, False, 0, "Kitchen", ["Famous"]),
            ("p-masala-chai", "cat-hot-chai", "Adrak Elaichi Masala Chai", 40.0, 10.0, True, False, 0, "Kitchen", ["Spiced"]),
            ("p-kashmiri-kahwa", "cat-hot-chai", "Kashmiri Saffron & Almond Kahwa", 110.0, 32.0, True, True, 0, "Kitchen", ["Saffron"]),
            ("p-matcha-tea", "cat-hot-chai", "Ceremonial Japanese Matcha Latte", 210.0, 65.0, True, False, 0, "Bar", ["Organic"]),

            # Coffees (cat-coffees)
            ("p-espresso", "cat-coffees", "Doppio Double Espresso", 120.0, 25.0, True, True, 0, "Bar", ["100% Arabica"]),
            ("p-cappuccino", "cat-coffees", "Classic Italian Cappuccino", 160.0, 38.0, True, False, 0, "Bar", ["Silky Foam"]),
            ("p-cold-brew", "cat-coffees", "24hr Steeped Nitro Cold Brew", 190.0, 35.0, True, True, 0, "Bar", ["Smooth"]),
            ("p-vanilla-latte", "cat-coffees", "Madagascar Vanilla Bean Latte", 180.0, 42.0, True, False, 0, "Bar", ["Sweet"]),

            # Tiffins (cat-breakfast)
            ("p-ghee-roast-dosa", "cat-breakfast", "Neyyi Ghee Podi Masala Dosa", 120.0, 28.0, True, False, 1, "Kitchen", ["Crispy", "Pure Ghee"]),
            ("p-steamed-idli", "cat-breakfast", "Button Ghee Sambar Idli (4 pcs)", 80.0, 18.0, True, False, 0, "Kitchen", ["Soft"]),
            ("p-medu-vada", "cat-breakfast", "Crispy Medu Vada with Coconut Chutney", 90.0, 20.0, True, False, 1, "Kitchen", ["Crunchy"]),
            ("p-pesara-dosa", "cat-breakfast", "Andhra MLA Pesarattu with Upma", 140.0, 32.0, True, False, 2, "Kitchen", ["Nutritious"]),

            # Tandoor & Starters (cat-tandoor)
            ("p-paneer-tikka", "cat-tandoor", "Smoked Malai Paneer Tikka", 290.0, 85.0, True, False, 2, "Grill", ["Tandoor Cooked"]),
            ("p-murgh-tikka", "cat-tandoor", "Bhatti Da Murgh Tikka", 360.0, 110.0, False, False, 3, "Grill", ["Chef Signature"]),
            ("p-dahi-kebab", "cat-tandoor", "Crispy Panko Dahi ke Kebab", 270.0, 72.0, True, False, 1, "Kitchen", ["Melt in mouth"]),
            ("p-seekh-kebab", "cat-tandoor", "Awadhi Mutton Galouti Kebab", 440.0, 160.0, False, False, 2, "Grill", ["Tender"]),

            # Pizzas (cat-pizzas)
            ("p-margherita", "cat-pizzas", "Neapolitan Margherita Pizza (12\")", 380.0, 95.0, True, False, 0, "Bakery", ["San Marzano", "Mozzarella"]),
            ("p-truffle-funghi", "cat-pizzas", "Wild Truffle & Mushroom Sourdough Pizza", 490.0, 140.0, True, False, 0, "Bakery", ["Gourmet"]),
            ("p-bbq-chicken-pizza", "cat-pizzas", "Smoked BBQ Chicken & Jalapeno Pizza", 460.0, 130.0, False, False, 2, "Bakery", ["Wood Fired"]),

            # Burgers (cat-burgers)
            ("p-truffle-burger", "cat-burgers", "Signature Smashed Brioche Burger", 320.0, 92.0, False, False, 1, "Kitchen", ["With Fries"]),
            ("p-crispy-paneer-burger", "cat-burgers", "Spicy Peri-Peri Paneer Crunch Burger", 280.0, 78.0, True, False, 2, "Kitchen", ["Spicy"]),

            # Biryani & Bowls (cat-biryani)
            ("p-hyderabadi-biryani", "cat-biryani", "Royal Hyderabadi Dum Biryani (Chicken)", 390.0, 115.0, False, False, 2, "Kitchen", ["Aged Basmati"]),
            ("p-paneer-biryani", "cat-biryani", "Dum Pukht Subz Paneer Biryani", 320.0, 88.0, True, False, 2, "Kitchen", ["Fragrant"]),

            # Desserts (cat-desserts)
            ("p-tiramisu", "cat-desserts", "Classic Italian Espresso Tiramisu", 240.0, 68.0, True, False, 0, "Bakery", ["Mascarpone"]),
            ("p-gulab-jamun", "cat-desserts", "Warm Stuffed Gulab Jamun with Rabri", 160.0, 42.0, True, False, 0, "Kitchen", ["Desi Ghee"]),
            ("p-cheesecake", "cat-desserts", "New York Baked Blueberry Cheesecake", 260.0, 75.0, True, False, 0, "Bakery", ["Creamy"]),
        ]

        prods_to_insert = []
        for p in products_data:
            pid, cid, name, price, cost, is_veg, is_vegan, spice, station, tags = p
            prods_to_insert.append({
                "_id": pid,
                "id": pid,
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "category_id": cid,
                "name": name,
                "slug": name.lower().replace(" ", "-"),
                "sku": f"SKU-{pid.upper()}",
                "base_price": price,
                "cost_price": cost,
                "tax_rate": 5.0,
                "is_available": True,
                "is_vegetarian": is_veg,
                "is_vegan": is_vegan,
                "is_gluten_free": False,
                "is_jain": False,
                "spice_level": spice,
                "prep_time_minutes": 10 if "Bar" in station else 18,
                "kitchen_station": station,
                "variants": [
                    {"id": f"{pid}-reg", "name": "Regular", "price": price, "cost_price": cost},
                    {"id": f"{pid}-large", "name": "Large / Double", "price": round(price * 1.5, 0), "cost_price": round(cost * 1.4, 0)}
                ],
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        await db["products"].insert_many(prods_to_insert)

        # 6. 50 Ingredients & Stock Ledger
        raw_ingredients = [
            ("ing-mango", "Alphonso Mango Pulp", "Produce", "kg", 85.0, 15.0, 120.0, "Cold Store"),
            ("ing-milk", "Farm Fresh Full Cream Milk", "Dairy", "l", 240.0, 40.0, 300.0, "Walk-in Chiller"),
            ("ing-coffee", "Specialty Arabica Roasted Beans", "Beverages", "kg", 35.0, 8.0, 50.0, "Dry Pantry"),
            ("ing-paneer", "Fresh Malai Cottage Cheese (Paneer)", "Dairy", "kg", 45.0, 10.0, 80.0, "Walk-in Chiller"),
            ("ing-chicken", "Fresh Chicken Breast (Boneless)", "Meat", "kg", 60.0, 15.0, 100.0, "Freezer 1"),
            ("ing-basmati", "Royal Aged Basmati Rice", "Dry Grocery", "kg", 180.0, 30.0, 250.0, "Main Store"),
            ("ing-ghee", "A2 Desi Cow Ghee", "Dairy", "kg", 40.0, 8.0, 60.0, "Dry Pantry"),
            ("ing-flour", "Neapolitan '00' Sourdough Flour", "Bakery", "kg", 90.0, 20.0, 150.0, "Bakery Store"),
            ("ing-mozzarella", "Fresh Buffalo Mozzarella Cheese", "Dairy", "kg", 32.0, 10.0, 60.0, "Walk-in Chiller"),
            ("ing-oranges", "Fresh Valencia Sweet Oranges", "Produce", "kg", 65.0, 20.0, 120.0, "Cold Store"),
            ("ing-tea-leaves", "Nilgiri CTC Black Tea Leaves", "Beverages", "kg", 50.0, 10.0, 80.0, "Dry Pantry"),
            ("ing-sugar", "Organic Cane Sugar", "Dry Grocery", "kg", 120.0, 25.0, 200.0, "Main Store"),
            ("ing-butter", "Unsalted Table Butter", "Dairy", "kg", 40.0, 10.0, 60.0, "Walk-in Chiller"),
            ("ing-onions", "Fresh Red Onions", "Produce", "kg", 150.0, 30.0, 200.0, "Veg Store"),
            ("ing-tomatoes", "Fresh Vine Ripe Tomatoes", "Produce", "kg", 110.0, 25.0, 150.0, "Veg Store"),
        ]
        ings_to_insert = [
            {
                "_id": ing[0],
                "id": ing[0],
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "name": ing[1],
                "code": f"ING-{ing[0][4:].upper()}",
                "category": ing[2],
                "unit": ing[3],
                "current_stock": ing[4],
                "minimum_stock": ing[5],
                "maximum_stock": 200.0,
                "unit_cost": ing[6],
                "storage_location": ing[7],
                "is_perishable": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            for ing in raw_ingredients
        ]
        await db["ingredients"].insert_many(ings_to_insert)

        # 6.5 Standard Recipe Mappings with Automatic Inventory Depletion
        recipes_data = [
            {
                "_id": "rec-hyderabadi-biryani",
                "id": "rec-hyderabadi-biryani",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "product_id": "p-hyderabadi-biryani",
                "product_name": "Royal Hyderabadi Dum Biryani (Chicken)",
                "yield_servings": 1,
                "ingredients": [
                    {"ingredient_id": "ing-chicken", "ingredient_name": "Fresh Chicken Breast (Boneless)", "quantity": 0.25, "unit": "kg", "unit_cost": 100.0, "total_cost": 25.0},
                    {"ingredient_id": "ing-basmati", "ingredient_name": "Royal Aged Basmati Rice", "quantity": 0.20, "unit": "kg", "unit_cost": 30.0, "total_cost": 6.0},
                    {"ingredient_id": "ing-ghee", "ingredient_name": "A2 Desi Cow Ghee", "quantity": 0.03, "unit": "kg", "unit_cost": 60.0, "total_cost": 1.8},
                    {"ingredient_id": "ing-onions", "ingredient_name": "Fresh Red Onions", "quantity": 0.10, "unit": "kg", "unit_cost": 30.0, "total_cost": 3.0},
                ],
                "total_food_cost": 35.8,
                "selling_price": 390.0,
                "food_cost_percentage": 9.18,
                "gross_margin_amount": 354.2,
                "gross_margin_percentage": 90.82,
                "instructions": "Slow cooked sealed dum with aged saffron and basmati",
                "version": 1,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "rec-paneer-biryani",
                "id": "rec-paneer-biryani",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "product_id": "p-paneer-biryani",
                "product_name": "Dum Pukht Subz Paneer Biryani",
                "yield_servings": 1,
                "ingredients": [
                    {"ingredient_id": "ing-paneer", "ingredient_name": "Fresh Malai Cottage Cheese (Paneer)", "quantity": 0.18, "unit": "kg", "unit_cost": 80.0, "total_cost": 14.4},
                    {"ingredient_id": "ing-basmati", "ingredient_name": "Royal Aged Basmati Rice", "quantity": 0.20, "unit": "kg", "unit_cost": 30.0, "total_cost": 6.0},
                    {"ingredient_id": "ing-ghee", "ingredient_name": "A2 Desi Cow Ghee", "quantity": 0.03, "unit": "kg", "unit_cost": 60.0, "total_cost": 1.8},
                ],
                "total_food_cost": 22.2,
                "selling_price": 320.0,
                "food_cost_percentage": 6.94,
                "gross_margin_amount": 297.8,
                "gross_margin_percentage": 93.06,
                "instructions": "Marinated malai paneer cubes layered with aromatic spices",
                "version": 1,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "rec-margherita",
                "id": "rec-margherita",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "product_id": "p-margherita",
                "product_name": "Neapolitan Margherita Pizza (12\")",
                "yield_servings": 1,
                "ingredients": [
                    {"ingredient_id": "ing-flour", "ingredient_name": "Neapolitan '00' Sourdough Flour", "quantity": 0.22, "unit": "kg", "unit_cost": 20.0, "total_cost": 4.4},
                    {"ingredient_id": "ing-mozzarella", "ingredient_name": "Fresh Buffalo Mozzarella Cheese", "quantity": 0.15, "unit": "kg", "unit_cost": 60.0, "total_cost": 9.0},
                    {"ingredient_id": "ing-tomatoes", "ingredient_name": "Fresh Vine Ripe Tomatoes", "quantity": 0.12, "unit": "kg", "unit_cost": 25.0, "total_cost": 3.0},
                ],
                "total_food_cost": 16.4,
                "selling_price": 380.0,
                "food_cost_percentage": 4.32,
                "gross_margin_amount": 363.6,
                "gross_margin_percentage": 95.68,
                "instructions": "Wood-fired at 450C for 90 seconds",
                "version": 1,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "rec-cappuccino",
                "id": "rec-cappuccino",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "product_id": "p-cappuccino",
                "product_name": "Classic Italian Cappuccino",
                "yield_servings": 1,
                "ingredients": [
                    {"ingredient_id": "ing-coffee", "ingredient_name": "Specialty Arabica Roasted Beans", "quantity": 0.02, "unit": "kg", "unit_cost": 50.0, "total_cost": 1.0},
                    {"ingredient_id": "ing-milk", "ingredient_name": "Farm Fresh Full Cream Milk", "quantity": 0.18, "unit": "l", "unit_cost": 40.0, "total_cost": 7.2},
                ],
                "total_food_cost": 8.2,
                "selling_price": 160.0,
                "food_cost_percentage": 5.12,
                "gross_margin_amount": 151.8,
                "gross_margin_percentage": 94.88,
                "instructions": "18g double shot Arabica espresso with micro-textured velvety milk foam",
                "version": 1,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "_id": "rec-mango-shake",
                "id": "rec-mango-shake",
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "product_id": "p-mango-shake",
                "product_name": "Thick Mango Malai Shake",
                "yield_servings": 1,
                "ingredients": [
                    {"ingredient_id": "ing-mango", "ingredient_name": "Alphonso Mango Pulp", "quantity": 0.15, "unit": "kg", "unit_cost": 120.0, "total_cost": 18.0},
                    {"ingredient_id": "ing-milk", "ingredient_name": "Farm Fresh Full Cream Milk", "quantity": 0.20, "unit": "l", "unit_cost": 40.0, "total_cost": 8.0},
                    {"ingredient_id": "ing-sugar", "ingredient_name": "Organic Cane Sugar", "quantity": 0.02, "unit": "kg", "unit_cost": 25.0, "total_cost": 0.5},
                ],
                "total_food_cost": 26.5,
                "selling_price": 160.0,
                "food_cost_percentage": 16.56,
                "gross_margin_amount": 133.5,
                "gross_margin_percentage": 83.44,
                "instructions": "Blended with pure Alphonso pulp and chilled rich milk",
                "version": 1,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db["recipes"].insert_many(recipes_data)


        # 7. Vendors & Purchase Orders
        vendors_data = [
            ("v-1", "Heritage Fresh Dairy & Milks", "Ramesh Yadav", "+91 98480 11223", ["Dairy", "Milk", "Paneer", "Butter"]),
            ("v-2", "Deccan Farm Produce Direct", "Suresh Patel", "+91 98480 33445", ["Produce", "Fruits", "Vegetables"]),
            ("v-3", "Blue Tokai Coffee Roasters Supply", "Aditya Sen", "+91 98480 55667", ["Beverages", "Coffee Beans", "Matcha"]),
            ("v-4", "Royal Spices & Dry Groceries", "Mohd. Farooq", "+91 98480 77889", ["Dry Grocery", "Rice", "Spices", "Ghee"]),
            ("v-5", "Artisan Bakery Ingredients Co.", "Clara D'Souza", "+91 98480 99001", ["Bakery", "Flour", "Yeast", "Cheese"])
        ]
        await db["vendors"].insert_many([
            {
                "_id": v[0], "id": v[0], "tenant_id": tenant_id, "branch_id": branch_1_id,
                "name": v[1], "company_name": v[1], "contact_person": v[2], "phone": v[3],
                "categories_supplied": v[4], "rating": 4.9, "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            for v in vendors_data
        ])

        # 8. 100 Customers & Customer Khata (Credit Ledger)
        customers_to_insert = []
        khata_to_insert = []
        first_names = ["Arjun", "Sneha", "Kiran", "Rohit", "Divya", "Aditi", "Manoj", "Siddharth", "Pooja", "Rohan", "Anjali", "Harish", "Neha", "Varun", "Deepa"]
        last_names = ["Reddy", "Sharma", "Rao", "Varma", "Patel", "Nair", "Iyer", "Choudhary", "Kapoor", "Gupta", "Sen", "Bhat"]
        
        for i in range(1, 41):
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            full_n = f"{fn} {ln}"
            phone = f"+91 98{i:02d}4 55{i:02d}2"
            cid = f"cust-{i:03d}"
            tier = "Platinum" if i <= 3 else ("Gold" if i <= 10 else ("Silver" if i <= 25 else "Bronze"))
            total_spent = round(random.uniform(1500, 48000), 2)
            pts = int(total_spent // 10)

            cust_doc = {
                "_id": cid,
                "id": cid,
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "name": full_n,
                "phone": phone,
                "email": f"{fn.lower()}.{ln.lower()}{i}@example.com",
                "tier": tier,
                "loyalty_points": pts,
                "total_spent": total_spent,
                "total_visits": random.randint(3, 42),
                "average_order_value": round(total_spent / max(1, random.randint(3, 12)), 2),
                "tags": ["VIP", "Regular"] if tier in ["Platinum", "Gold"] else ["Regular"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            customers_to_insert.append(cust_doc)

            # Khata entry for subset of customers
            if i in [1, 2, 4, 7, 9]:
                credit_amt = round(random.uniform(400, 2500), 2)
                paid_amt = round(random.uniform(100, 1500), 2)
                bal = round(credit_amt - paid_amt, 2)
                khata_to_insert.append({
                    "_id": f"khata-{cid}",
                    "id": f"khata-{cid}",
                    "tenant_id": tenant_id,
                    "branch_id": branch_1_id,
                    "customer_id": cid,
                    "customer_name": full_n,
                    "customer_phone": phone,
                    "credit_limit": 5000.0,
                    "total_credit": credit_amt,
                    "total_paid": paid_amt,
                    "current_balance": bal,
                    "status": "active",
                    "entries": [
                        {"id": str(uuid.uuid4()), "entry_type": "credit", "amount": credit_amt, "description": "Weekly food tab", "created_at": datetime.now(timezone.utc).isoformat()},
                        {"id": str(uuid.uuid4()), "entry_type": "payment", "amount": paid_amt, "payment_mode": "upi", "description": "GPay payment received", "created_at": datetime.now(timezone.utc).isoformat()}
                    ],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                })

        await db["customers"].insert_many(customers_to_insert)
        if khata_to_insert:
            await db["customer_khata"].insert_many(khata_to_insert)

        # 9. 100 Realistic Orders spanning Dine-in, Quick Sale, Takeaway, Online
        orders_to_insert = []
        for i in range(1, 101):
            oid = f"ord-{i:04d}"
            order_num = f"ORD-{1000 + i}"
            otype = "quick_sale" if i % 3 == 0 else ("dine_in" if i % 2 == 0 else "takeaway")
            tbl = f"T-{(i % 12) + 1:02d}" if otype == "dine_in" else None
            
            # 2 to 4 random items
            sample_prods = random.sample(prods_to_insert, k=random.randint(1, 3))
            subtotal = 0.0
            order_items = []
            for p in sample_prods:
                qty = random.randint(1, 3)
                total = p["base_price"] * qty
                subtotal += total
                order_items.append({
                    "id": str(uuid.uuid4()),
                    "product_id": p["id"],
                    "product_name": p["name"],
                    "unit_price": p["base_price"],
                    "quantity": qty,
                    "total_price": total,
                    "kitchen_station": p["kitchen_station"],
                    "status": "ready" if i > 10 else "preparing"
                })

            tax = round(subtotal * 0.05, 2)
            grand = round(subtotal + tax, 2)
            payment_meth = "upi" if i % 2 == 0 else ("cash" if i % 3 == 0 else "card")
            
            created_dt = datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 48), minutes=random.randint(0, 59))
            
            orders_to_insert.append({
                "_id": oid,
                "id": oid,
                "tenant_id": tenant_id,
                "branch_id": branch_1_id,
                "order_number": order_num,
                "order_type": otype,
                "table_number": tbl,
                "customer_name": customers_to_insert[i % len(customers_to_insert)]["name"],
                "customer_phone": customers_to_insert[i % len(customers_to_insert)]["phone"],
                "items": order_items,
                "subtotal": subtotal,
                "tax_amount": tax,
                "discount_amount": 0.0,
                "grand_total": grand,
                "status": "completed" if i > 10 else "preparing",
                "payment_status": "paid",
                "payments": [
                    {
                        "method": payment_meth,
                        "amount": grand,
                        "transaction_ref": f"TXN-{10000 + i}",
                        "status": "completed",
                        "created_at": created_dt.isoformat()
                    }
                ],
                "created_at": created_dt.isoformat(),
                "updated_at": created_dt.isoformat(),
                "completed_at": (created_dt + timedelta(minutes=18)).isoformat() if i > 10 else None
            })
        await db["orders"].insert_many(orders_to_insert)

        # 10. Expenses & Smart Alerts
        expenses_data = [
            {"category_name": "Utilities & Power", "title": "Commercial Electricity Bill (Solar Offset)", "amount": 18450.0, "expense_date": datetime.now().strftime("%Y-%m-%d"), "payment_mode": "Bank Transfer"},
            {"category_name": "Produce Supplies", "title": "Fresh Fruit & Vegetable Morning Consignment", "amount": 8400.0, "expense_date": datetime.now().strftime("%Y-%m-%d"), "payment_mode": "UPI"},
            {"category_name": "Dairy Supplies", "title": "Full Cream Milk & Paneer Daily Supply", "amount": 6200.0, "expense_date": datetime.now().strftime("%Y-%m-%d"), "payment_mode": "Cash"},
            {"category_name": "Maintenance", "title": "Espresso Machine Calibration & RO Servicing", "amount": 4500.0, "expense_date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"), "payment_mode": "UPI"},
        ]
        await db["expenses"].insert_many([
            {
                "_id": str(uuid.uuid4()), "id": str(uuid.uuid4()), "tenant_id": tenant_id, "branch_id": branch_1_id,
                "category_name": e["category_name"], "title": e["title"], "amount": e["amount"],
                "expense_date": e["expense_date"], "payment_mode": e["payment_mode"], "status": "approved",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            for e in expenses_data
        ])

        alerts_data = [
            {"alert_type": "low_inventory", "severity": "warning", "title": "Low Stock: Full Cream Milk", "message": "Milk inventory is down to 40L (Reorder point: 40L). Daily consumption is 65L.", "is_resolved": False},
            {"alert_type": "kitchen_sla_delay", "severity": "info", "title": "Peak SLA Notice: Grill Station", "message": "Average grill ticket time increased to 16.4 mins during 8 PM peak.", "is_resolved": False},
            {"alert_type": "khata_credit", "severity": "info", "title": "Khata Balance Due", "message": "Sneha Sharma has an outstanding tab balance of ₹1,840 due this weekend.", "is_resolved": False}
        ]
        await db["alerts"].insert_many([
            {
                "_id": str(uuid.uuid4()), "id": str(uuid.uuid4()), "tenant_id": tenant_id, "branch_id": branch_1_id,
                "alert_type": a["alert_type"], "severity": a["severity"], "title": a["title"],
                "message": a["message"], "is_resolved": a["is_resolved"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            for a in alerts_data
        ])

        logger.info("Realistic enterprise seed dataset created successfully!")
        return {
            "status": "success",
            "message": "Enterprise seed dataset successfully generated",
            "tenant_id": tenant_id,
            "test_accounts": [
                {"email": "admin@aura.io", "password": "password123", "role": "Super Admin"},
                {"email": "owner@aura.io", "password": "password123", "role": "Organization Owner"},
                {"email": "cashier@aura.io", "password": "password123", "role": "Cashier (POS)"},
                {"email": "chef@aura.io", "password": "password123", "role": "Chef (KDS)"}
            ]
        }
