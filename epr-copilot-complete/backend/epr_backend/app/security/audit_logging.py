import logging
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from enum import Enum

audit_logger = logging.getLogger("audit")
audit_handler = logging.FileHandler("audit.log")
audit_formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
audit_handler.setFormatter(audit_formatter)
audit_logger.addHandler(audit_handler)
audit_logger.setLevel(logging.INFO)

Base = declarative_base()


class AuditEventType(Enum):
    """Types of audit events."""
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    FILE_UPLOAD = "file_upload"
    FILE_DOWNLOAD = "file_download"
    PAYMENT_PROCESSED = "payment_processed"
    REPORT_GENERATED = "report_generated"
    API_KEY_CREATED = "api_key_created"
    API_KEY_DELETED = "api_key_deleted"
    PERMISSION_CHANGED = "permission_changed"
    SECURITY_VIOLATION = "security_violation"
    SYSTEM_ERROR = "system_error"


class AuditLog(Base):
    """Database model for audit logs."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    event_type = Column(String(50), index=True)
    user_id = Column(String(50), index=True)
    user_email = Column(String(255))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    resource = Column(String(255))
    action = Column(String(100))
    details = Column(Text)  # JSON string
    success = Column(Boolean, default=True)
    # low, medium, high, critical
    risk_level = Column(String(20), default="low")


class SecurityAuditor:
    """Handle security audit logging and monitoring."""

    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL", "sqlite:///./audit.db")
        self.engine = create_engine(self.db_url)
        Base.metadata.create_all(bind=self.engine)
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine)
        self.db = SessionLocal()

    def log_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        resource: Optional[str] = None,
        action: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        success: bool = True,
        risk_level: str = "low"
    ):
        """Log a security audit event."""

        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type.value,
            "user_id": user_id,
            "user_email": user_email,
            "ip_address": ip_address,
            "resource": resource,
            "action": action,
            "success": success,
            "risk_level": risk_level,
            "details": details or {}
        }

        audit_logger.info(json.dumps(log_entry))

        try:
            audit_record = AuditLog(
                event_type=event_type.value,
                user_id=user_id,
                user_email=user_email,
                ip_address=ip_address,
                user_agent=user_agent,
                resource=resource,
                action=action,
                details=json.dumps(details or {}),
                success=success,
                risk_level=risk_level
            )

            self.db.add(audit_record)
            self.db.commit()

        except Exception as e:
            logging.error(f"Failed to store audit log in database: {e}")
            self.db.rollback()

    def log_authentication(
        self,
        user_email: str,
        ip_address: str,
        user_agent: str,
        success: bool,
        failure_reason: Optional[str] = None
    ):
        """Log authentication attempts."""
        event_type = AuditEventType.LOGIN if success else AuditEventType.LOGIN_FAILED
        risk_level = "low" if success else "medium"

        details = {}
        if not success and failure_reason:
            details["failure_reason"] = failure_reason
            risk_level = "high" if "brute_force" in failure_reason.lower() else "medium"

        self.log_event(
            event_type=event_type,
            user_email=user_email,
            ip_address=ip_address,
            user_agent=user_agent,
            action="authenticate",
            details=details,
            success=success,
            risk_level=risk_level
        )

    def log_data_access(
        self,
        user_id: str,
        user_email: str,
        resource: str,
        action: str,
        ip_address: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log data access events."""
        self.log_event(
            event_type=AuditEventType.DATA_ACCESS,
            user_id=user_id,
            user_email=user_email,
            ip_address=ip_address,
            resource=resource,
            action=action,
            details=details,
            risk_level="low"
        )

    def log_data_modification(
        self,
        user_id: str,
        user_email: str,
        resource: str,
        action: str,
        ip_address: str,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None
    ):
        """Log data modification events."""
        details = {}
        if old_values:
            details["old_values"] = old_values
        if new_values:
            details["new_values"] = new_values

        self.log_event(
            event_type=AuditEventType.DATA_MODIFICATION,
            user_id=user_id,
            user_email=user_email,
            ip_address=ip_address,
            resource=resource,
            action=action,
            details=details,
            risk_level="medium"
        )

    def log_security_violation(
        self,
        violation_type: str,
        ip_address: str,
        user_agent: str,
        details: Dict[str, Any],
        user_id: Optional[str] = None
    ):
        """Log security violations."""
        self.log_event(
            event_type=AuditEventType.SECURITY_VIOLATION,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            action=violation_type,
            details=details,
            success=False,
            risk_level="critical"
        )

    def log_payment_event(
        self,
        user_id: str,
        user_email: str,
        payment_id: str,
        amount: float,
        currency: str,
        ip_address: str,
        success: bool
    ):
        """Log payment processing events."""
        details = {
            "payment_id": payment_id,
            "amount": amount,
            "currency": currency
        }

        self.log_event(
            event_type=AuditEventType.PAYMENT_PROCESSED,
            user_id=user_id,
            user_email=user_email,
            ip_address=ip_address,
            resource="payment",
            action="process_payment",
            details=details,
            success=success,
            risk_level="high"
        )

    def get_audit_logs(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        user_id: Optional[str] = None,
        event_type: Optional[str] = None,
        risk_level: Optional[str] = None,
        limit: int = 100
    ) -> list:
        """Retrieve audit logs with filters."""
        query = self.db.query(AuditLog)

        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if event_type:
            query = query.filter(AuditLog.event_type == event_type)
        if risk_level:
            query = query.filter(AuditLog.risk_level == risk_level)

        return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()


security_auditor = SecurityAuditor()


def audit_endpoint(
        event_type: AuditEventType,
        resource: str,
        risk_level: str = "low"):
    """Decorator to automatically audit API endpoints."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            from fastapi import Request

            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if request:
                ip_address = request.client.host
                user_agent = request.headers.get("user-agent", "")

                try:
                    result = func(*args, **kwargs)

                    security_auditor.log_event(
                        event_type=event_type,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        resource=resource,
                        action=func.__name__,
                        success=True,
                        risk_level=risk_level
                    )

                    return result

                except Exception as e:
                    security_auditor.log_event(
                        event_type=event_type,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        resource=resource,
                        action=func.__name__,
                        details={"error": str(e)},
                        success=False,
                        risk_level="high"
                    )
                    raise
            else:
                return func(*args, **kwargs)

        return wrapper
    return decorator
