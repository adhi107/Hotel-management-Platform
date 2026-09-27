import logging
from typing import Optional, Any, Dict
import json
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("aura.redis")

class RedisClient:
    redis: Optional[aioredis.Redis] = None
    _memory_cache: Dict[str, Any] = {}
    _use_memory: bool = False

redis_client = RedisClient()

async def connect_to_redis():
    try:
        redis_client.redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2
        )
        await redis_client.redis.ping()
        redis_client._use_memory = False
        logger.info(f"Connected to Redis at {settings.REDIS_URL}")
    except Exception as e:
        if settings.USE_IN_MEMORY_REDIS_FALLBACK:
            logger.warning(f"Redis not reachable ({e}). Initializing In-Memory Cache Store.")
            redis_client._use_memory = True
        else:
            raise e

async def close_redis_connection():
    if redis_client.redis:
        await redis_client.redis.close()
        logger.info("Redis connection closed.")

async def cache_get(key: str) -> Optional[Any]:
    if redis_client._use_memory or not redis_client.redis:
        return redis_client._memory_cache.get(key)
    try:
        val = await redis_client.redis.get(key)
        if val:
            return json.loads(val)
        return None
    except Exception:
        return redis_client._memory_cache.get(key)

async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> bool:
    if redis_client._use_memory or not redis_client.redis:
        redis_client._memory_cache[key] = value
        return True
    try:
        await redis_client.redis.set(key, json.dumps(value), ex=ttl_seconds)
        return True
    except Exception:
        redis_client._memory_cache[key] = value
        return True

async def cache_delete(key: str) -> bool:
    if redis_client._use_memory or not redis_client.redis:
        redis_client._memory_cache.pop(key, None)
        return True
    try:
        await redis_client.redis.delete(key)
        return True
    except Exception:
        redis_client._memory_cache.pop(key, None)
        return True
