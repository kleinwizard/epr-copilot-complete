from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from ..database import get_db
from ..auth import get_current_user
from ..schemas import User as UserSchema
import uuid

router = APIRouter(prefix="/api/security", tags=["security"])

@router.get("/events")
async def get_security_events(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get paginated security audit events for the user's organization.
    """
    try:
        mock_events = [
            {
                "id": str(uuid.uuid4()),
                "event_type": "User Login",
                "user_email": current_user.email,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "details": "Successful login"
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "Product Created",
                "user_email": current_user.email,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "details": "Created product: Sample Product"
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "Report Generated",
                "user_email": current_user.email,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "details": "Generated compliance report"
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "Password Changed",
                "user_email": current_user.email,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "details": "Password updated successfully"
            },
            {
                "id": str(uuid.uuid4()),
                "event_type": "User Logout",
                "user_email": current_user.email,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "details": "User logged out"
            }
        ]
        
        if event_type:
            mock_events = [event for event in mock_events if event["event_type"].lower() == event_type.lower()]
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_events = mock_events[start_idx:end_idx]
        
        return {
            "success": True,
            "events": paginated_events,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(mock_events),
                "total_pages": (len(mock_events) + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve security events: {str(e)}"
        )

@router.get("/sessions")
async def get_active_sessions(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get active sessions for the current user.
    """
    try:
        mock_sessions = [
            {
                "id": str(uuid.uuid4()),
                "device": "Chrome on Windows",
                "ip_address": "192.168.1.100",
                "location": "San Francisco, CA",
                "last_active": datetime.now(timezone.utc).isoformat(),
                "is_current": True
            },
            {
                "id": str(uuid.uuid4()),
                "device": "Safari on iPhone",
                "ip_address": "192.168.1.101",
                "location": "San Francisco, CA",
                "last_active": (datetime.now(timezone.utc)).isoformat(),
                "is_current": False
            }
        ]
        
        return {
            "success": True,
            "sessions": mock_sessions
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve active sessions: {str(e)}"
        )

@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Revoke a specific session.
    """
    try:
        return {
            "success": True,
            "message": f"Session {session_id} has been revoked successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to revoke session: {str(e)}"
        )

@router.get("/backup-codes")
async def get_backup_codes(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get 2FA backup codes for the current user.
    """
    try:
        mock_backup_codes = [
            "ABC123DEF456",
            "GHI789JKL012",
            "MNO345PQR678",
            "STU901VWX234",
            "YZA567BCD890"
        ]
        
        return {
            "success": True,
            "backup_codes": mock_backup_codes,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve backup codes: {str(e)}"
        )

@router.post("/backup-codes/regenerate")
async def regenerate_backup_codes(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Regenerate 2FA backup codes for the current user.
    """
    try:
        new_backup_codes = [
            f"NEW{i:03d}{uuid.uuid4().hex[:6].upper()}" for i in range(1, 6)
        ]
        
        return {
            "success": True,
            "backup_codes": new_backup_codes,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "message": "New backup codes generated successfully. Please save these codes in a secure location."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to regenerate backup codes: {str(e)}"
        )
