import logging
import copy
import uuid
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("aura.database")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    _in_memory_store: Dict[str, List[Dict[str, Any]]] = {}
    _use_in_memory: bool = False

db = Database()

class MockAsyncCursor:
    def __init__(self, data: List[Dict[str, Any]], sort_spec=None, limit_val=0, skip_val=0):
        self.data = list(data)
        if sort_spec:
            for field, direction in reversed(sort_spec):
                reverse = direction < 0
                self.data.sort(key=lambda x: (x.get(field) is None, x.get(field, "")), reverse=reverse)
        if skip_val > 0:
            self.data = self.data[skip_val:]
        if limit_val > 0:
            self.data = self.data[:limit_val]
        self._iter = iter(self.data)

    def sort(self, key_or_list, direction=None):
        if isinstance(key_or_list, str):
            sort_spec = [(key_or_list, direction or 1)]
        else:
            sort_spec = key_or_list
        return MockAsyncCursor(self.data, sort_spec)

    def skip(self, n: int):
        return MockAsyncCursor(self.data[n:])

    def limit(self, n: int):
        return MockAsyncCursor(self.data[:n])

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration

    async def to_list(self, length: Optional[int] = None):
        if length is not None:
            return self.data[:length]
        return self.data

class MockAsyncCollection:
    def __init__(self, name: str, store: Dict[str, List[Dict[str, Any]]]):
        self.name = name
        self.store = store
        if name not in self.store:
            self.store[name] = []

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "$or":
                if not any(self._matches(doc, q) for q in v):
                    return False
                continue
            if k == "$and":
                if not all(self._matches(doc, q) for q in v):
                    return False
                continue
            if isinstance(v, dict):
                doc_val = doc.get(k)
                if "$in" in v and doc_val not in v["$in"]:
                    return False
                if "$nin" in v and doc_val in v["$nin"]:
                    return False
                if "$gte" in v and (doc_val is None or doc_val < v["$gte"]):
                    return False
                if "$lte" in v and (doc_val is None or doc_val > v["$lte"]):
                    return False
                if "$gt" in v and (doc_val is None or doc_val <= v["$gt"]):
                    return False
                if "$lt" in v and (doc_val is None or doc_val >= v["$lt"]):
                    return False
                if "$ne" in v and doc_val == v["$ne"]:
                    return False
                if "$regex" in v:
                    import re
                    opts = re.IGNORECASE if v.get("$options") == "i" else 0
                    if not re.search(v["$regex"], str(doc_val or ""), opts):
                        return False
            elif doc.get(k) != v:
                return False
        return True

    async def find_one(self, filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for item in self.store[self.name]:
            if self._matches(item, filter):
                return copy.deepcopy(item)
        return None

    def find(self, filter: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        res = [copy.deepcopy(x) for x in self.store[self.name] if self._matches(x, filter or {})]
        return MockAsyncCursor(res)

    async def insert_one(self, document: Dict[str, Any]):
        doc = copy.deepcopy(document)
        if "id" not in doc and "_id" not in doc:
            doc["id"] = str(uuid.uuid4())
        if "_id" not in doc and "id" in doc:
            doc["_id"] = doc["id"]
        self.store[self.name].append(doc)
        class InsertResult:
            inserted_id = doc.get("_id") or doc.get("id")
        return InsertResult()

    async def insert_many(self, documents: List[Dict[str, Any]]):
        inserted_ids = []
        for d in documents:
            doc = copy.deepcopy(d)
            if "id" not in doc and "_id" not in doc:
                doc["id"] = str(uuid.uuid4())
            if "_id" not in doc and "id" in doc:
                doc["_id"] = doc["id"]
            self.store[self.name].append(doc)
            inserted_ids.append(doc.get("_id") or doc.get("id"))

        class InsertManyResult:
            pass
        res = InsertManyResult()
        res.inserted_ids = inserted_ids
        return res

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any]):
        class UpdateResult:
            matched_count = 0
            modified_count = 0
        res = UpdateResult()
        for i, item in enumerate(self.store[self.name]):
            if self._matches(item, filter):
                res.matched_count = 1
                if "$set" in update:
                    for k, v in update["$set"].items():
                        self.store[self.name][i][k] = v
                    res.modified_count = 1
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        self.store[self.name][i][k] = self.store[self.name][i].get(k, 0) + v
                    res.modified_count = 1
                break
        return res

    async def update_many(self, filter: Dict[str, Any], update: Dict[str, Any]):
        class UpdateResult:
            matched_count = 0
            modified_count = 0
        res = UpdateResult()
        for i, item in enumerate(self.store[self.name]):
            if self._matches(item, filter):
                res.matched_count += 1
                if "$set" in update:
                    for k, v in update["$set"].items():
                        self.store[self.name][i][k] = v
                    res.modified_count += 1
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        self.store[self.name][i][k] = self.store[self.name][i].get(k, 0) + v
                    res.modified_count += 1
        return res

    async def delete_one(self, filter: Dict[str, Any]):
        class DeleteResult:
            deleted_count = 0
        res = DeleteResult()
        for i, item in enumerate(self.store[self.name]):
            if self._matches(item, filter):
                del self.store[self.name][i]
                res.deleted_count = 1
                break
        return res

    async def delete_many(self, filter: Dict[str, Any]):
        class DeleteResult:
            deleted_count = 0
        res = DeleteResult()
        orig_len = len(self.store[self.name])
        self.store[self.name] = [item for item in self.store[self.name] if not self._matches(item, filter)]
        res.deleted_count = orig_len - len(self.store[self.name])
        return res

    async def count_documents(self, filter: Dict[str, Any]) -> int:
        return sum(1 for item in self.store[self.name] if self._matches(item, filter))

    async def create_index(self, keys, **kwargs):
        return "index_created"

class MockAsyncDatabase:
    def __init__(self, store: Dict[str, List[Dict[str, Any]]]):
        self.store = store
        self._collections = {}

    def __getitem__(self, name: str):
        if name not in self._collections:
            self._collections[name] = MockAsyncCollection(name, self.store)
        return self._collections[name]

    def get_collection(self, name: str):
        return self[name]

    async def list_collection_names(self):
        return list(self.store.keys())

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGO_URI, 
            serverSelectionTimeoutMS=2000,
            uuidRepresentation="standard"
        )
        # Verify connection
        await db.client.admin.command('ping')
        db.db = db.client[settings.MONGO_DB_NAME]
        db._use_in_memory = False
        logger.info(f"Connected to MongoDB at {settings.MONGO_URI} (db: {settings.MONGO_DB_NAME})")
    except Exception as e:
        if settings.USE_IN_MEMORY_DB_FALLBACK:
            logger.warning(f"MongoDB not reachable ({e}). Initializing High-Performance In-Memory Async Document Engine.")
            db.db = MockAsyncDatabase(db._in_memory_store)
            db._use_in_memory = True
        else:
            raise e

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed.")

class ProxyCollection:
    def __init__(self, name: str):
        self._name = name

    @property
    def _target(self):
        target_db = get_database()
        if hasattr(target_db, "get_collection"):
            return target_db.get_collection(self._name)
        return target_db[self._name]

    def __getattr__(self, name: str):
        return getattr(self._target, name)

    async def find_one(self, *args, **kwargs):
        return await self._target.find_one(*args, **kwargs)

    def find(self, *args, **kwargs):
        return self._target.find(*args, **kwargs)

    async def insert_one(self, *args, **kwargs):
        return await self._target.insert_one(*args, **kwargs)

    async def insert_many(self, *args, **kwargs):
        return await self._target.insert_many(*args, **kwargs)

    async def update_one(self, *args, **kwargs):
        return await self._target.update_one(*args, **kwargs)

    async def update_many(self, *args, **kwargs):
        return await self._target.update_many(*args, **kwargs)

    async def delete_one(self, *args, **kwargs):
        return await self._target.delete_one(*args, **kwargs)

    async def delete_many(self, *args, **kwargs):
        return await self._target.delete_many(*args, **kwargs)

    async def count_documents(self, *args, **kwargs):
        return await self._target.count_documents(*args, **kwargs)

    async def create_index(self, *args, **kwargs):
        return await self._target.create_index(*args, **kwargs)

def get_database():
    if db.db is None:
        db.db = MockAsyncDatabase(db._in_memory_store)
    return db.db

def get_collection(name: str):
    return ProxyCollection(name)

