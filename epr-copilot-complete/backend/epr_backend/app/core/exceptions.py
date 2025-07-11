from fastapi import HTTPException
from datetime import datetime, timezone
from typing import Optional, Dict, Any


class EPRException(Exception):
    """Base exception for all EPR-specific errors"""
    def __init__(self, message: str, code: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class NotificationException(EPRException):
    def __init__(self, service: str, operation: str, reason: str):
        super().__init__(
            message=f"Failed to {operation} via {service}: {reason}",
            code=f"NOTIFICATION_{service.upper()}_{operation.upper()}_FAILED",
            status_code=500,
            details={"service": service, "operation": operation, "reason": reason}
        )


def create_error_response(exc: EPRException) -> Dict[str, Any]:
    return {
        "error": {
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
