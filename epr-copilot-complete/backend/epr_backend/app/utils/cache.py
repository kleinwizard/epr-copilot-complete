"""
Redis caching utilities for EPR application
"""

import json
import redis
from typing import Any, Optional, Callable
from functools import wraps
from datetime import timedelta
import os
import logging

logger = logging.getLogger(__name__)

redis_client = None

def get_redis_client():
    global redis_client
    if redis_client is None:
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        try:
            redis_client = redis.from_url(redis_url, decode_responses=True)
            redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Caching will be disabled.")
            redis_client = None
    return redis_client

def cache_result(
    key_prefix: str,
    ttl: int = 300,  # 5 minutes default
    serialize_args: bool = True
):
    """
    Decorator to cache function results in Redis
    
    Args:
        key_prefix: Prefix for the cache key
        ttl: Time to live in seconds
        serialize_args: Whether to include function arguments in cache key
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            client = get_redis_client()
            if not client:
                return func(*args, **kwargs)
            
            if serialize_args:
                args_str = json.dumps([str(arg) for arg in args], sort_keys=True)
                kwargs_str = json.dumps(kwargs, sort_keys=True)
                cache_key = f"{key_prefix}:{hash(args_str + kwargs_str)}"
            else:
                cache_key = key_prefix
            
            try:
                cached_result = client.get(cache_key)
                if cached_result:
                    logger.debug(f"Cache hit for key: {cache_key}")
                    return json.loads(cached_result)
                
                result = func(*args, **kwargs)
                client.setex(cache_key, ttl, json.dumps(result, default=str))
                logger.debug(f"Cached result for key: {cache_key}")
                return result
                
            except Exception as e:
                logger.error(f"Cache operation failed: {e}")
                return func(*args, **kwargs)
        
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern: str):
    """
    Invalidate all cache keys matching a pattern
    """
    client = get_redis_client()
    if not client:
        return
    
    try:
        keys = client.keys(pattern)
        if keys:
            client.delete(*keys)
            logger.info(f"Invalidated {len(keys)} cache keys matching pattern: {pattern}")
    except Exception as e:
        logger.error(f"Cache invalidation failed: {e}")

def clear_organization_cache(organization_id: str):
    """
    Clear all cached data for a specific organization
    """
    patterns = [
        f"products:{organization_id}:*",
        f"materials:{organization_id}:*",
        f"fees:{organization_id}:*",
        f"compliance:{organization_id}:*"
    ]
    
    for pattern in patterns:
        invalidate_cache_pattern(pattern)

class CacheManager:
    """
    Context manager for cache operations
    """
    
    @staticmethod
    def get_jurisdiction_rates(jurisdiction: str) -> Optional[dict]:
        """Get cached jurisdiction fee rates"""
        client = get_redis_client()
        if not client:
            return None
        
        try:
            cached_rates = client.get(f"jurisdiction_rates:{jurisdiction}")
            return json.loads(cached_rates) if cached_rates else None
        except Exception as e:
            logger.error(f"Failed to get cached jurisdiction rates: {e}")
            return None
    
    @staticmethod
    def set_jurisdiction_rates(jurisdiction: str, rates: dict, ttl: int = 3600):
        """Cache jurisdiction fee rates for 1 hour"""
        client = get_redis_client()
        if not client:
            return
        
        try:
            client.setex(f"jurisdiction_rates:{jurisdiction}", ttl, json.dumps(rates, default=str))
            logger.debug(f"Cached jurisdiction rates for: {jurisdiction}")
        except Exception as e:
            logger.error(f"Failed to cache jurisdiction rates: {e}")
    
    @staticmethod
    def get_material_categories(jurisdiction: str) -> Optional[list]:
        """Get cached material categories for jurisdiction"""
        client = get_redis_client()
        if not client:
            return None
        
        try:
            cached_categories = client.get(f"material_categories:{jurisdiction}")
            return json.loads(cached_categories) if cached_categories else None
        except Exception as e:
            logger.error(f"Failed to get cached material categories: {e}")
            return None
    
    @staticmethod
    def set_material_categories(jurisdiction: str, categories: list, ttl: int = 3600):
        """Cache material categories for 1 hour"""
        client = get_redis_client()
        if not client:
            return
        
        try:
            client.setex(f"material_categories:{jurisdiction}", ttl, json.dumps(categories, default=str))
            logger.debug(f"Cached material categories for: {jurisdiction}")
        except Exception as e:
            logger.error(f"Failed to cache material categories: {e}")
