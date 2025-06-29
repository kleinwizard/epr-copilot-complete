from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from typing import Dict, Any
import redis
import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=2,  # Use different DB for rate limiting
    decode_responses=True
)

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}/2"
)


class CustomRateLimiter:
    """Custom rate limiter with advanced features."""

    def __init__(self):
        self.redis_client = redis_client
        self.blocked_ips = set()
        self.suspicious_ips = set()

    def is_ip_blocked(self, ip_address: str) -> bool:
        """Check if an IP address is blocked."""
        return ip_address in self.blocked_ips or self.redis_client.get(
            f"blocked_ip:{ip_address}")

    def block_ip(self, ip_address: str, duration_minutes: int = 60):
        """Block an IP address for a specified duration."""
        self.blocked_ips.add(ip_address)
        self.redis_client.setex(
            f"blocked_ip:{ip_address}",
            duration_minutes * 60,
            "1")
        logger.warning(
            f"IP address {ip_address} blocked for {duration_minutes} minutes")

    def unblock_ip(self, ip_address: str):
        """Unblock an IP address."""
        self.blocked_ips.discard(ip_address)
        self.redis_client.delete(f"blocked_ip:{ip_address}")
        logger.info(f"IP address {ip_address} unblocked")

    def track_failed_attempt(self, ip_address: str, endpoint: str):
        """Track failed attempts and implement progressive blocking."""
        key = f"failed_attempts:{ip_address}:{endpoint}"
        current_attempts = self.redis_client.get(key)

        if current_attempts is None:
            attempts = 1
            self.redis_client.setex(key, 300, attempts)  # 5 minute window
        else:
            attempts = int(current_attempts) + 1
            self.redis_client.setex(key, 300, attempts)

        if attempts >= 10:
            self.block_ip(ip_address, 120)  # 2 hours
        elif attempts >= 5:
            self.block_ip(ip_address, 30)   # 30 minutes
        elif attempts >= 3:
            self.suspicious_ips.add(ip_address)
            logger.warning(
                f"IP {ip_address} marked as suspicious after {attempts} failed attempts")

    def is_suspicious(self, ip_address: str) -> bool:
        """Check if an IP is marked as suspicious."""
        return ip_address in self.suspicious_ips

    def get_rate_limit_info(self, ip_address: str,
                            endpoint: str) -> Dict[str, Any]:
        """Get rate limit information for an IP and endpoint."""
        key = f"rate_limit:{ip_address}:{endpoint}"
        current_requests = self.redis_client.get(key)

        return {
            "ip_address": ip_address,
            "endpoint": endpoint,
            "current_requests": int(current_requests) if current_requests else 0,
            "is_blocked": self.is_ip_blocked(ip_address),
            "is_suspicious": self.is_suspicious(ip_address)}


custom_rate_limiter = CustomRateLimiter()


def check_ip_blocked(request: Request):
    """Middleware to check if IP is blocked."""
    client_ip = get_remote_address(request)

    if custom_rate_limiter.is_ip_blocked(client_ip):
        logger.warning(f"Blocked IP {client_ip} attempted access")
        raise HTTPException(
            status_code=429,
            detail="IP address is temporarily blocked due to suspicious activity")


def enhanced_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Enhanced rate limit exceeded handler."""
    client_ip = get_remote_address(request)
    endpoint = request.url.path

    custom_rate_limiter.track_failed_attempt(client_ip, endpoint)

    from .audit_logging import security_auditor, AuditEventType
    security_auditor.log_event(
        event_type=AuditEventType.SECURITY_VIOLATION,
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent", ""),
        resource=endpoint,
        action="rate_limit_exceeded",
        details={
            "limit": str(exc.detail),
            "endpoint": endpoint
        },
        success=False,
        risk_level="medium"
    )

    return _rate_limit_exceeded_handler(request, exc)


def auth_rate_limit():
    """Rate limit for authentication endpoints."""
    return limiter.limit("5/minute")


def api_rate_limit():
    """Rate limit for general API endpoints."""
    return limiter.limit("100/minute")


def upload_rate_limit():
    """Rate limit for file upload endpoints."""
    return limiter.limit("10/minute")


def payment_rate_limit():
    """Rate limit for payment endpoints."""
    return limiter.limit("20/minute")


def report_rate_limit():
    """Rate limit for report generation endpoints."""
    return limiter.limit("5/minute")


class TieredRateLimiter:
    """Rate limiter that adjusts limits based on user subscription tier."""

    TIER_LIMITS = {
        "free": {
            "api_calls": "50/minute",
            "uploads": "5/minute",
            "reports": "2/minute"
        },
        "basic": {
            "api_calls": "200/minute",
            "uploads": "20/minute",
            "reports": "10/minute"
        },
        "premium": {
            "api_calls": "1000/minute",
            "uploads": "100/minute",
            "reports": "50/minute"
        },
        "enterprise": {
            "api_calls": "5000/minute",
            "uploads": "500/minute",
            "reports": "200/minute"
        }
    }

    @classmethod
    def get_limit_for_user(cls, user_tier: str, limit_type: str) -> str:
        """Get rate limit for a specific user tier and limit type."""
        return cls.TIER_LIMITS.get(user_tier, cls.TIER_LIMITS["free"]).get(
            limit_type, cls.TIER_LIMITS["free"][limit_type]
        )


def get_client_identifier(request: Request) -> str:
    """Get a unique identifier for the client (IP + User-Agent hash)."""
    import hashlib

    ip = get_remote_address(request)
    user_agent = request.headers.get("user-agent", "")

    identifier = f"{ip}:{hashlib.md5(user_agent.encode()).hexdigest()[:8]}"
    return identifier


def log_rate_limit_violation(request: Request, limit_type: str):
    """Log rate limit violations for monitoring."""
    client_ip = get_remote_address(request)
    endpoint = request.url.path

    logger.warning(
        f"Rate limit violation - IP: {client_ip}, Endpoint: {endpoint}, "
        f"Limit Type: {limit_type}, User-Agent: {request.headers.get('user-agent', 'Unknown')}"
    )
