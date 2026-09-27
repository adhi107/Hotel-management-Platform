import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.schemas.crm import CustomerCreate, KhataEntryCreate
from app.core.exceptions import NotFoundException, BadRequestException

class CrmService:
    def __init__(self):
        self.customers_col = get_collection("customers")
        self.khata_col = get_collection("customer_khata")
        self.loyalty_tx_col = get_collection("loyalty_transactions")

    async def list_customers(self) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        cursor = self.customers_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}}).sort("name", 1)
        return await cursor.to_list(500)

    async def create_customer(self, req: CustomerCreate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        cust_id = str(uuid.uuid4())

        doc = {
            "_id": cust_id,
            "id": cust_id,
            "tenant_id": tenant_id,
            "branch_id": branch_id,
            "name": req.name,
            "phone": req.phone,
            "email": req.email,
            "birthday": req.birthday,
            "anniversary": req.anniversary,
            "tier": "Bronze",
            "loyalty_points": 50, # Welcome bonus
            "total_spent": 0.0,
            "total_visits": 0,
            "average_order_value": 0.0,
            "allergies": req.allergies,
            "preferences": req.preferences,
            "tags": ["New"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.customers_col.insert_one(doc)
        return doc

    async def get_khata_ledger(self) -> List[Dict[str, Any]]:
        tenant_id = TenantContext.get_tenant_id()
        cursor = self.khata_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}}).sort("updated_at", -1)
        return await cursor.to_list(200)

    async def record_khata_entry(self, req: KhataEntryCreate) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        user = TenantContext.get_current_user()

        customer = await self.customers_col.find_one({"id": req.customer_id, "tenant_id": tenant_id})
        cust_name = customer["name"] if customer else "Khata Customer"
        cust_phone = customer["phone"] if customer else ""

        khata = await self.khata_col.find_one({"customer_id": req.customer_id, "tenant_id": tenant_id})
        
        entry = {
            "id": str(uuid.uuid4()),
            "entry_type": req.entry_type,
            "amount": req.amount,
            "payment_mode": req.payment_mode,
            "order_id": req.order_id,
            "description": req.description or ("Credit added" if req.entry_type == "credit" else "Payment received"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": user.get("id") if user else None
        }

        if khata:
            entries = khata.get("entries", [])
            entries.append(entry)
            
            total_credit = khata.get("total_credit", 0.0) + (req.amount if req.entry_type == "credit" else 0.0)
            total_paid = khata.get("total_paid", 0.0) + (req.amount if req.entry_type == "payment" else 0.0)
            balance = round(total_credit - total_paid, 2)
            
            await self.khata_col.update_one(
                {"id": khata["id"]},
                {
                    "$set": {
                        "total_credit": total_credit,
                        "total_paid": total_paid,
                        "current_balance": balance,
                        "entries": entries,
                        "last_payment_date": datetime.now(timezone.utc).isoformat() if req.entry_type == "payment" else khata.get("last_payment_date"),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            return await self.khata_col.find_one({"id": khata["id"]})
        else:
            khata_id = str(uuid.uuid4())
            total_credit = req.amount if req.entry_type == "credit" else 0.0
            total_paid = req.amount if req.entry_type == "payment" else 0.0
            balance = round(total_credit - total_paid, 2)
            
            doc = {
                "_id": khata_id,
                "id": khata_id,
                "tenant_id": tenant_id,
                "branch_id": branch_id,
                "customer_id": req.customer_id,
                "customer_name": cust_name,
                "customer_phone": cust_phone,
                "credit_limit": 5000.0,
                "total_credit": total_credit,
                "total_paid": total_paid,
                "current_balance": balance,
                "status": "active",
                "entries": [entry],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await self.khata_col.insert_one(doc)
            return doc
