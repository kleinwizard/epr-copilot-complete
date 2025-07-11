from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from ..database import get_db
from ..auth import get_current_user
from ..services.email_service import email_service
from ..services.sms_service import sms_service
from ..services.push_notification_service import push_notification_service
from ..core.config import NotificationConfig
from ..core.exceptions import NotificationException, create_error_response
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class InvitationRequest(BaseModel):
    email: EmailStr
    role: str = "member"


class DeadlineReminderRequest(BaseModel):
    deadline_type: str
    due_date: str
    days_remaining: int


class ReportNotificationRequest(BaseModel):
    report_type: str
    status: str
    report_id: str


class SMSRequest(BaseModel):
    phone_number: str
    message: str


class PushNotificationRequest(BaseModel):
    device_tokens: List[str]
    title: str
    body: str
    data: dict = {}


class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    priority: str
    status: str
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    deadline_reminders: bool = True
    compliance_alerts: bool = True
    team_notifications: bool = True


@router.post("/send-invitation")
async def send_team_invitation(
    request: InvitationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a team invitation email."""

    invitation_link = NotificationConfig.get_invitation_url("example_token", request.email)

    result = await email_service.send_invitation_email(
        to_email=request.email,
        inviter_name=current_user.email,  # In production, use actual name
        organization_name="Your Organization",  # Get from current_user.organization
        invitation_link=invitation_link
    )

    if not result.success:
        exc = NotificationException("email", "send_invitation", result.message or "Unknown error")
        raise HTTPException(status_code=exc.status_code, detail=create_error_response(exc))

    return {
        "message": "Invitation sent successfully",
        "email": request.email,
        "status": "sent",
        "simulated": result.simulated
    }


@router.post("/send-deadline-reminder")
async def send_deadline_reminder(
    request: DeadlineReminderRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a compliance deadline reminder email."""

    result = await email_service.send_deadline_reminder(
        to_email=current_user.email,
        user_name=current_user.email,  # In production, use actual name
        deadline_type=request.deadline_type,
        due_date=request.due_date,
        days_remaining=request.days_remaining
    )

    if not result.success:
        exc = NotificationException("email", "send_deadline_reminder", result.message or "Unknown error")
        raise HTTPException(status_code=exc.status_code, detail=create_error_response(exc))

    return {
        "message": "Deadline reminder sent successfully",
        "deadline_type": request.deadline_type,
        "status": "sent",
        "simulated": result.simulated
    }


@router.post("/send-report-notification")
async def send_report_notification(
    request: ReportNotificationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a report status notification email."""

    report_link = NotificationConfig.get_report_url(request.report_id)

    result = await email_service.send_report_notification(
        to_email=current_user.email,
        user_name=current_user.email,  # In production, use actual name
        report_type=request.report_type,
        status=request.status,
        report_link=report_link
    )

    if not result.success:
        exc = NotificationException("email", "send_report_notification", result.message or "Unknown error")
        raise HTTPException(status_code=exc.status_code, detail=create_error_response(exc))

    return {
        "message": "Report notification sent successfully",
        "report_type": request.report_type,
        "status": "sent",
        "simulated": result.simulated
    }


@router.post("/send-sms")
async def send_sms_notification(
    request: SMSRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an SMS notification."""

    result = await sms_service.send_sms(
        to_number=request.phone_number,
        message=request.message
    )

    if not result.success:
        exc = NotificationException("sms", "send_sms", result.message or "Unknown error")
        raise HTTPException(status_code=exc.status_code, detail=create_error_response(exc))

    return {
        "message": "SMS sent successfully",
        "phone_number": request.phone_number,
        "status": "sent",
        "simulated": result.simulated
    }


@router.post("/send-push")
async def send_push_notification(
    request: PushNotificationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a push notification."""

    result = await push_notification_service.send_push_notification(
        device_tokens=request.device_tokens,
        title=request.title,
        body=request.body,
        data=request.data
    )

    if not result.success:
        exc = NotificationException("push", "send_push_notification", result.message or "Unknown error")
        raise HTTPException(status_code=exc.status_code, detail=create_error_response(exc))

    return {
        "message": "Push notification sent successfully",
        "device_count": len(request.device_tokens),
        "status": "sent",
        "simulated": result.simulated
    }


@router.get("/test-email")
async def test_email_service(
    current_user=Depends(get_current_user)
):
    """Test the email service configuration."""

    result = await email_service.send_email(
        to_emails=[current_user.email],
        subject="EPR Co-Pilot Email Test",
        html_content="<p>This is a test email from EPR Co-Pilot. If you received this, email service is working correctly!</p>"
    )

    return {
        "message": "Test email sent" if result.success else "Test email failed",
        "status": "success" if result.success else "error",
        "email_configured": email_service.client is not None,
        "simulated": result.simulated
    }


@router.get("/test-sms")
async def test_sms_service(
    phone_number: str,
    current_user=Depends(get_current_user)
):
    """Test the SMS service configuration."""

    result = await sms_service.send_sms(
        to_number=phone_number,
        message="This is a test SMS from EPR Co-Pilot. If you received this, SMS service is working correctly!"
    )

    return {
        "message": "Test SMS sent" if result.success else "Test SMS failed",
        "status": "success" if result.success else "error",
        "sms_configured": sms_service.client is not None,
        "simulated": result.simulated
    }


@router.get("/test-push")
async def test_push_service(
    device_token: str,
    current_user=Depends(get_current_user)
):
    """Test the push notification service configuration."""

    result = await push_notification_service.send_push_notification(
        device_tokens=[device_token],
        title="EPR Co-Pilot Test",
        body="This is a test push notification. If you received this, push notifications are working correctly!"
    )

    return {
        "message": "Test push notification sent" if result.success else "Test push notification failed",
        "status": "success" if result.success else "error",
        "push_configured": push_notification_service.app is not None,
        "simulated": result.simulated
    }


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None, pattern="^(read|unread)$"),
    type: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[NotificationResponse]:
    """Get notifications for the current user."""
    from ..database import Notification
    
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.organization_id == current_user.organization_id
    )
    
    if status:
        query = query.filter(Notification.status == status)
    if type:
        query = query.filter(Notification.type == type)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        NotificationResponse(
            id=n.id,
            title=n.title,
            message=n.message,
            type=n.type,
            priority=n.priority,
            status=n.status,
            created_at=n.created_at,
            read_at=n.read_at
        )
        for n in notifications
    ]


@router.get("/count")
async def get_notification_count(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Get count of unread notifications."""
    from ..database import Notification
    
    total_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.organization_id == current_user.organization_id
    ).count()
    
    # Count unread notifications
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.organization_id == current_user.organization_id,
        Notification.status == "unread"
    ).count()
    
    return {
        "unread_count": unread_count,
        "total_count": total_count
    }


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Mark a notification as read."""
    from ..database import Notification
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
        Notification.organization_id == current_user.organization_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.status = "read"
    notification.read_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "message": "Notification marked as read",
        "notification_id": notification_id,
        "status": "read",
        "read_at": notification.read_at.isoformat()
    }


@router.put("/mark-all-read")
async def mark_all_notifications_read(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Mark all notifications as read."""
    from ..database import Notification
    
    updated_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.organization_id == current_user.organization_id,
        Notification.status == "unread"
    ).update({
        "status": "read",
        "read_at": datetime.now(timezone.utc)
    })
    
    db.commit()
    
    return {
        "message": "All notifications marked as read",
        "updated_count": updated_count,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Delete a notification."""
    from ..database import Notification
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
        Notification.organization_id == current_user.organization_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Delete notification
    db.delete(notification)
    db.commit()
    
    return {
        "message": "Notification deleted successfully",
        "notification_id": notification_id
    }


@router.get("/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> NotificationPreferences:
    """Get user notification preferences."""
    from ..database import NotificationPreference
    
    preferences = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    
    if not preferences:
        return NotificationPreferences(
            email_notifications=True,
            sms_notifications=False,
            push_notifications=True,
            deadline_reminders=True,
            compliance_alerts=True,
            team_notifications=True
        )
    
    return NotificationPreferences(
        email_notifications=preferences.email_notifications,
        sms_notifications=preferences.sms_notifications,
        push_notifications=preferences.push_notifications,
        deadline_reminders=preferences.deadline_reminders,
        compliance_alerts=preferences.compliance_alerts,
        team_notifications=preferences.team_notifications
    )


@router.put("/preferences")
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Update user notification preferences."""
    from ..database import NotificationPreference
    
    user_preferences = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    
    if not user_preferences:
        user_preferences = NotificationPreference(
            user_id=current_user.id,
            email_notifications=preferences.email_notifications,
            sms_notifications=preferences.sms_notifications,
            push_notifications=preferences.push_notifications,
            deadline_reminders=preferences.deadline_reminders,
            compliance_alerts=preferences.compliance_alerts,
            team_notifications=preferences.team_notifications
        )
        db.add(user_preferences)
    else:
        user_preferences.email_notifications = preferences.email_notifications
        user_preferences.sms_notifications = preferences.sms_notifications
        user_preferences.push_notifications = preferences.push_notifications
        user_preferences.deadline_reminders = preferences.deadline_reminders
        user_preferences.compliance_alerts = preferences.compliance_alerts
        user_preferences.team_notifications = preferences.team_notifications
        user_preferences.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "message": "Notification preferences updated successfully",
        "preferences": preferences.dict(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


@router.post("/test")
async def create_test_notification(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Create a test notification for debugging."""
    from ..database import Notification
    
    test_notification = Notification(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        title="Test Notification",
        message=f"This is a test notification created at {datetime.now(timezone.utc).isoformat()}",
        type="system",
        priority="low",
        status="unread",
        metadata={"test": True, "created_by": "api_test"}
    )
    
    db.add(test_notification)
    db.commit()
    db.refresh(test_notification)
    
    return {
        "message": "Test notification created",
        "notification": {
            "id": test_notification.id,
            "title": test_notification.title,
            "message": test_notification.message,
            "type": test_notification.type,
            "priority": test_notification.priority,
            "status": test_notification.status,
            "created_at": test_notification.created_at.isoformat()
        }
    }
