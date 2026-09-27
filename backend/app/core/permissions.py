from enum import Enum
from typing import List, Dict, Set

class Module(str, Enum):
    DASHBOARD = "dashboard"
    POS = "pos"
    ORDERS = "orders"
    KITCHEN = "kitchen"
    TABLES = "tables"
    MENU = "menu"
    INVENTORY = "inventory"
    RECIPES = "recipes"
    PROCUREMENT = "procurement"
    CUSTOMERS = "customers"
    LOYALTY = "loyalty"
    RESERVATIONS = "reservations"
    EMPLOYEES = "employees"
    EXPENSES = "expenses"
    REPORTS = "reports"
    SETTINGS = "settings"
    SUPERADMIN = "superadmin"
    ALERTS = "alerts"
    AI = "ai"

class Action(str, Enum):
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    APPROVE = "approve"
    EXPORT = "export"
    REFUND = "refund"
    CANCEL = "cancel"
    ASSIGN = "assign"
    MANAGE = "manage"

class Scope(str, Enum):
    OWN = "own"
    DEPARTMENT = "department"
    BRANCH = "branch"
    ORGANIZATION = "organization"
    ALL = "all"

DEFAULT_ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "super_admin": ["*:*:*:*"],
    "organization_owner": [
        "dashboard:*:view:organization",
        "dashboard:*:manage:organization",
        "pos:*:*:organization",
        "orders:*:*:organization",
        "kitchen:*:*:organization",
        "tables:*:*:organization",
        "menu:*:*:organization",
        "inventory:*:*:organization",
        "recipes:*:*:organization",
        "procurement:*:*:organization",
        "customers:*:*:organization",
        "loyalty:*:*:organization",
        "reservations:*:*:organization",
        "employees:*:*:organization",
        "expenses:*:*:organization",
        "reports:*:*:organization",
        "settings:*:*:organization",
        "alerts:*:*:organization",
        "ai:*:*:organization",
    ],
    "branch_manager": [
        "dashboard:*:view:branch",
        "pos:*:*:branch",
        "orders:*:*:branch",
        "kitchen:*:*:branch",
        "tables:*:*:branch",
        "menu:*:view:branch",
        "menu:*:edit:branch",
        "inventory:*:*:branch",
        "recipes:*:view:branch",
        "procurement:*:*:branch",
        "customers:*:*:branch",
        "loyalty:*:*:branch",
        "reservations:*:*:branch",
        "employees:*:*:branch",
        "expenses:*:*:branch",
        "reports:*:*:branch",
        "alerts:*:*:branch",
        "ai:*:*:branch",
    ],
    "cashier": [
        "dashboard:*:view:branch",
        "pos:*:*:branch",
        "orders:*:view:branch",
        "orders:*:create:branch",
        "orders:*:edit:branch",
        "tables:*:view:branch",
        "customers:*:*:branch",
        "loyalty:*:view:branch",
        "loyalty:*:create:branch",
    ],
    "waiter": [
        "pos:*:create:branch",
        "orders:*:view:branch",
        "orders:*:create:branch",
        "tables:*:view:branch",
        "tables:*:edit:branch",
        "menu:*:view:branch",
    ],
    "chef": [
        "kitchen:*:*:branch",
        "orders:*:view:branch",
        "menu:*:view:branch",
        "inventory:*:view:branch",
        "recipes:*:view:branch",
    ],
    "inventory_manager": [
        "inventory:*:*:branch",
        "recipes:*:*:branch",
        "procurement:*:*:branch",
        "reports:inventory:view:branch",
        "alerts:inventory:view:branch",
    ]
}

def has_permission(user_permissions: List[str], required_permission: str) -> bool:
    if "*:*:*:*" in user_permissions or "super_admin" in user_permissions:
        return True
    
    req_parts = required_permission.split(":")
    if len(req_parts) != 4:
        # Fallback for simpler strings like "orders:create"
        if any(p.startswith(required_permission) or p == "*:*:*:*" for p in user_permissions):
            return True

    for p in user_permissions:
        if p == "*:*:*:*":
            return True
        p_parts = p.split(":")
        if len(p_parts) == 4:
            m_match = (p_parts[0] == "*" or p_parts[0] == req_parts[0])
            r_match = (p_parts[1] == "*" or p_parts[1] == req_parts[1])
            a_match = (p_parts[2] == "*" or p_parts[2] == req_parts[2])
            s_match = (p_parts[3] == "*" or p_parts[3] == req_parts[3] or p_parts[3] == "organization" and req_parts[3] == "branch")
            if m_match and r_match and a_match and s_match:
                return True
    return False
