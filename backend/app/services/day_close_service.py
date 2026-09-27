import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.schemas.day_close import DayCloseCreate

class DayCloseService:
    def __init__(self):
        self.day_close_col = get_collection("day_close")
        self.orders_col = get_collection("orders")
        self.expenses_col = get_collection("expenses")
        self.khata_col = get_collection("customer_khata")

    async def get_day_summary(self, business_date: Optional[str] = None) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        target_date = business_date or datetime.now().strftime("%Y-%m-%d")

        query: Dict[str, Any] = {"tenant_id": tenant_id, "is_deleted": {"$ne": True}}
        if branch_id:
            query["branch_id"] = branch_id

        orders = await self.orders_col.find(query).to_list(1000)
        # Filter for today's orders
        day_orders = [o for o in orders if str(o.get("created_at", "")).startswith(target_date)]

        total_sales = sum(o.get("grand_total", 0.0) for o in day_orders if o.get("status") != "cancelled")
        total_orders = len(day_orders)
        
        cash_sales = 0.0
        upi_sales = 0.0
        card_sales = 0.0
        khata_sales = 0.0

        for o in day_orders:
            for p in o.get("payments", []):
                amt = p.get("amount", 0.0)
                m = p.get("method", "cash").lower()
                if m == "cash":
                    cash_sales += amt
                elif m == "upi":
                    upi_sales += amt
                elif m == "card":
                    card_sales += amt
                elif m == "khata":
                    khata_sales += amt

        # Expenses
        expenses = await self.expenses_col.find(query).to_list(200)
        day_expenses = [e for e in expenses if str(e.get("expense_date", "")).startswith(target_date)]
        total_expenses = sum(e.get("amount", 0.0) for e in day_expenses)

        # Expected cash in drawer = cash sales - cash expenses
        expected_cash = max(0.0, cash_sales)

        return {
            "business_date": target_date,
            "total_orders": total_orders,
            "total_sales": round(total_sales, 2),
            "cash_sales": round(cash_sales, 2),
            "upi_sales": round(upi_sales, 2),
            "card_sales": round(card_sales, 2),
            "khata_sales": round(khata_sales, 2),
            "total_expenses": round(total_expenses, 2),
            "expected_cash": round(expected_cash, 2)
        }

    async def execute_day_close(self, req: DayCloseCreate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        user = TenantContext.get_current_user()

        summary = await self.get_day_summary(req.business_date)
        expected_cash = summary["expected_cash"] + req.opening_cash_float
        discrepancy = round(req.actual_cash_counted - expected_cash, 2)

        close_id = str(uuid.uuid4())
        doc = {
            "_id": close_id,
            "id": close_id,
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "business_date": req.business_date,
            "closed_at": datetime.now(timezone.utc).isoformat(),
            "closed_by_user_id": user.get("id") if user else "system",
            "closed_by_name": user.get("role", "Owner") if user else "Admin",
            "total_orders": summary["total_orders"],
            "total_sales": summary["total_sales"],
            "cash_sales": summary["cash_sales"],
            "upi_sales": summary["upi_sales"],
            "card_sales": summary["card_sales"],
            "khata_credit_sales": summary["khata_sales"],
            "total_expenses": summary["total_expenses"],
            "opening_cash_float": req.opening_cash_float,
            "expected_cash_in_drawer": expected_cash,
            "actual_cash_counted": req.actual_cash_counted,
            "cash_discrepancy": discrepancy,
            "notes": req.notes,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await self.day_close_col.insert_one(doc)
        return doc
