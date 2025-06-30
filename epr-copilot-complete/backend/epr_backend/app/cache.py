import redis
import json
import functools
from typing import Any, Optional
from datetime import timedelta
try:
    from .config import settings
except ImportError:
    settings = None

redis_client = redis.Redis(
    host=getattr(settings, 'REDIS_HOST', 'localhost') if settings else 'localhost',
    port=getattr(settings, 'REDIS_PORT', 6379) if settings else 6379,
    db=getattr(settings, 'REDIS_DB', 0) if settings else 0,
    decode_responses=True
)

def cache_result(expiration: timedelta = timedelta(hours=1)):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            try:
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    return json.loads(cached_result)
            except Exception:
                pass
            
            result = await func(*args, **kwargs)
            
            try:
                redis_client.setex(
                    cache_key,
                    int(expiration.total_seconds()),
                    json.dumps(result, default=str)
                )
            except Exception:
                pass
            
            return result
        return wrapper
    return decorator
