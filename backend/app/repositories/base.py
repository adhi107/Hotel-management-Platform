from typing import TypeVar, Generic, Type, Optional, List, Dict, Any, Tuple
from app.core.database import get_collection
from app.core.tenant_context import TenantContext
from app.models.base import BaseDocument, TenantDocument
from datetime import datetime, timezone
import copy

T = TypeVar("T", bound=BaseDocument)

class BaseRepository(Generic[T]):
    def __init__(self, collection_name: str, model_cls: Type[T]):
        self.collection_name = collection_name
        self.model_cls = model_cls

    @property
    def collection(self):
        return get_collection(self.collection_name)

    def _build_filter(self, filter_dict: Optional[Dict[str, Any]] = None, include_deleted: bool = False) -> Dict[str, Any]:
        query = copy.deepcopy(filter_dict or {})
        if not include_deleted:
            query["is_deleted"] = {"$ne": True}
        return query

    async def find_one(self, filter_dict: Dict[str, Any]) -> Optional[T]:
        query = self._build_filter(filter_dict)
        doc = await self.collection.find_one(query)
        if doc:
            if "_id" in doc and "id" not in doc:
                doc["id"] = str(doc["_id"])
            return self.model_cls(**doc)
        return None

    async def find_by_id(self, id: str) -> Optional[T]:
        return await self.find_one({"id": id})

    async def find(
        self,
        filter_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[List[Tuple[str, int]]] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[T]:
        query = self._build_filter(filter_dict)
        cursor = self.collection.find(query)
        if sort:
            cursor = cursor.sort(sort)
        if skip > 0:
            cursor = cursor.skip(skip)
        if limit > 0:
            cursor = cursor.limit(limit)
        
        docs = await cursor.to_list(length=limit)
        results = []
        for d in docs:
            if "_id" in d and "id" not in d:
                d["id"] = str(d["_id"])
            results.append(self.model_cls(**d))
        return results

    async def count(self, filter_dict: Optional[Dict[str, Any]] = None) -> int:
        query = self._build_filter(filter_dict)
        return await self.collection.count_documents(query)

    async def create(self, item: T) -> T:
        doc = item.model_dump()
        if "id" not in doc or not doc["id"]:
            import uuid
            doc["id"] = str(uuid.uuid4())
        doc["_id"] = doc["id"]
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        doc["updated_at"] = doc["created_at"]
        await self.collection.insert_one(doc)
        return self.model_cls(**doc)

    async def update(self, id: str, update_data: Dict[str, Any]) -> Optional[T]:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        user = TenantContext.get_current_user()
        if user and user.get("id"):
            update_data["updated_by"] = user["id"]
            
        await self.collection.update_one(
            {"id": id},
            {"$set": update_data}
        )
        return await self.find_by_id(id)

    async def delete(self, id: str, soft: bool = True) -> bool:
        if soft:
            res = await self.collection.update_one(
                {"id": id},
                {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            return res.modified_count > 0
        else:
            res = await self.collection.delete_one({"id": id})
            return res.deleted_count > 0

class TenantRepository(BaseRepository[T]):
    """Tenant-isolated repository automatically injecting tenant context to all queries and mutations."""
    def _build_filter(
        self, 
        filter_dict: Optional[Dict[str, Any]] = None, 
        include_deleted: bool = False,
        enforce_branch: bool = False
    ) -> Dict[str, Any]:
        query = super()._build_filter(filter_dict, include_deleted)
        
        tenant_id = TenantContext.get_tenant_id()
        if tenant_id and "tenant_id" not in query:
            query["tenant_id"] = tenant_id
            
        if enforce_branch:
            branch_id = TenantContext.get_branch_id()
            if branch_id and "branch_id" not in query:
                query["branch_id"] = branch_id
                
        return query

    async def create(self, item: T) -> T:
        tenant_id = TenantContext.get_tenant_id()
        org_id = TenantContext.get_org_id()
        branch_id = TenantContext.get_branch_id()
        user = TenantContext.get_current_user()

        if isinstance(item, TenantDocument):
            if not item.tenant_id and tenant_id:
                item.tenant_id = tenant_id
            if not item.organization_id and org_id:
                item.organization_id = org_id
            if not item.branch_id and branch_id:
                item.branch_id = branch_id
            if user and user.get("id"):
                item.created_by = user["id"]

        return await super().create(item)
