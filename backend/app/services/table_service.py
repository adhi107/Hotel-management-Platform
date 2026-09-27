import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.websocket.manager import ws_manager
from app.core.exceptions import NotFoundException

class TableService:
    def __init__(self):
        self.floors_col = get_collection("floors")
        self.sections_col = get_collection("sections")
        self.tables_col = get_collection("tables")

    async def get_floor_plan(self) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        
        query = {"tenant_id": tenant_id, "is_deleted": {"$ne": True}}
        if branch_id:
            query["branch_id"] = branch_id

        floors = await self.floors_col.find(query).sort("level", 1).to_list(20)
        sections = await self.sections_col.find(query).to_list(50)
        tables = await self.tables_col.find(query).to_list(200)

        return {
            "floors": floors,
            "sections": sections,
            "tables": tables
        }

    async def update_table_status(self, table_id: str, status: str) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        table = await self.tables_col.find_one({"id": table_id, "tenant_id": tenant_id})
        if not table:
            raise NotFoundException("Table", table_id)

        update_data = {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        if status == "available":
            update_data["current_order_id"] = None

        await self.tables_col.update_one({"id": table_id}, {"$set": update_data})
        updated = await self.tables_col.find_one({"id": table_id})

        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:tables", {
                "event": "TABLE_STATUS_CHANGED",
                "data": updated
            })

        return updated

    async def create_table(self, table_data: Dict[str, Any]) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()
        
        table_id = f"tbl-{uuid.uuid4().hex[:8]}"
        new_table = {
            "id": table_id,
            "tenant_id": tenant_id,
            "branch_id": branch_id or "branch-main",
            "table_number": table_data.get("table_number", f"T-{uuid.uuid4().hex[:3]}"),
            "capacity": int(table_data.get("capacity", 4)),
            "shape": table_data.get("shape", "square"),
            "section_id": table_data.get("section_id") or "sec-main",
            "section_name": table_data.get("section_name", "Main Dining"),
            "floor_id": table_data.get("floor_id") or "flr-1",
            "floor_name": table_data.get("floor_name", "Ground Floor"),
            "status": table_data.get("status", "available"),
            "pos_x": int(table_data.get("pos_x", 100)),
            "pos_y": int(table_data.get("pos_y", 100)),
            "current_order_id": None,
            "is_active": table_data.get("is_active", True),
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        await self.tables_col.insert_one(new_table)
        created = await self.tables_col.find_one({"id": table_id})

        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:tables", {
                "event": "TABLE_CREATED",
                "data": created
            })

        return created

    async def update_table(self, table_id: str, update_fields: Dict[str, Any]) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()

        table = await self.tables_col.find_one({"id": table_id, "tenant_id": tenant_id})
        if not table:
            raise NotFoundException("Table", table_id)

        clean_fields = {k: v for k, v in update_fields.items() if v is not None}
        clean_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

        if clean_fields.get("status") == "available":
            clean_fields["current_order_id"] = None

        await self.tables_col.update_one(
            {"id": table_id, "tenant_id": tenant_id},
            {"$set": clean_fields}
        )
        updated = await self.tables_col.find_one({"id": table_id})

        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:tables", {
                "event": "TABLE_UPDATED",
                "data": updated
            })

        return updated

    async def delete_table(self, table_id: str) -> Dict[str, Any]:
        tenant_id = TenantContext.get_tenant_id()
        branch_id = TenantContext.get_branch_id()

        table = await self.tables_col.find_one({"id": table_id, "tenant_id": tenant_id})
        if not table:
            raise NotFoundException("Table", table_id)

        await self.tables_col.update_one(
            {"id": table_id, "tenant_id": tenant_id},
            {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        if branch_id:
            await ws_manager.broadcast_to_channel(f"branch:{branch_id}:tables", {
                "event": "TABLE_DELETED",
                "data": {"id": table_id}
            })

        return {"id": table_id, "deleted": True}
