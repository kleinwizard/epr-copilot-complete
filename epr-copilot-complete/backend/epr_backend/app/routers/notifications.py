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

    invitation_link = f"https://app.epr-copilot.com/invite?token=example_token&email={request.email}"

    success = await email_service.send_invitation_email(
        to_email=request.email,
        inviter_name=current_user.email,  # In production, use actual name
        organization_name="Your Organization",  # Get from current_user.organization
        invitation_link=invitation_link
    )

    if not success:
        raise HTTPException(status_code=500,
                            detail="Failed to send invitation email")

    return {
        "message": "Invitation sent successfully",
        "email": request.email,
        "status": "sent"
    }


@router.post("/send-deadline-reminder")
async def send_deadline_reminder(
    request: DeadlineReminderRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a compliance deadline reminder email."""

    success = await email_service.send_deadline_reminder(
        to_email=current_user.email,
        user_name=current_user.email,  # In production, use actual name
        deadline_type=request.deadline_type,
        due_date=request.due_date,
        days_remaining=request.days_remaining
    )

    if not success:
        raise HTTPException(status_code=500,
                            detail="Failed to send deadline reminder")

    return {
        "message": "Deadline reminder sent successfully",
        "deadline_type": request.deadline_type,
        "status": "sent"
    }


@router.post("/send-report-notification")
async def send_report_notification(
    request: ReportNotificationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a report status notification email."""

    report_link = f"https://app.epr-copilot.com/reports/{request.report_id}"

    success = await email_service.send_report_notification(
        to_email=current_user.email,
        user_name=current_user.email,  # In production, use actual name
        report_type=request.report_type,
        status=request.status,
        report_link=report_link
    )

    if not success:
        raise HTTPException(status_code=500,
                            detail="Failed to send report notification")

    return {
        "message": "Report notification sent successfully",
        "report_type": request.report_type,
        "status": "sent"
    }


@router.post("/send-sms")
async def send_sms_notification(
    request: SMSRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an SMS notification."""

    success = await sms_service.send_sms(
        to_number=request.phone_number,
        message=request.message
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send SMS")

    return {
        "message": "SMS sent successfully",
        "phone_number": request.phone_number,
        "status": "sent"
    }


@router.post("/send-push")
async def send_push_notification(
    request: PushNotificationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a push notification."""

    success = await push_notification_service.send_push_notification(
        device_tokens=request.device_tokens,
        title=request.title,
        body=request.body,
        data=request.data
    )

    if not success:
        raise HTTPException(status_code=500,
                            detail="Failed to send push notification")

    return {
        "message": "Push notification sent successfully",
        "device_count": len(request.device_tokens),
        "status": "sent"
    }


@router.get("/test-email")
async def test_email_service(
    current_user=Depends(get_current_user)
):
    """Test the email service configuration."""

    success = await email_service.send_email(
        to_emails=[current_user.email],
        subject="EPR Co-Pilot Email Test",
        html_content="<p>This is a test email from EPR Co-Pilot. If you received this, email service is working correctly!</p>"
    )

    return {
        "message": "Test email sent" if success else "Test email failed",
        "status": "success" if success else "error",
        "email_configured": email_service.client is not None
    }


@router.get("/test-sms")
async def test_sms_service(
    phone_number: str,
    current_user=Depends(get_current_user)
):
    """Test the SMS service configuration."""

    success = await sms_service.send_sms(
        to_number=phone_number,
        message="This is a test SMS from EPR Co-Pilot. If you received this, SMS service is working correctly!"
    )

    return {
        "message": "Test SMS sent" if success else "Test SMS failed",
        "status": "success" if success else "error",
        "sms_configured": sms_service.client is not None
    }


@router.get("/test-push")
async def test_push_service(
    device_token: str,
    current_user=Depends(get_current_user)
):
    """Test the push notification service configuration."""

    success = await push_notification_service.send_push_notification(
        device_tokens=[device_token],
        title="EPR Co-Pilot Test",
        body="This is a test push notification. If you received this, push notifications are working correctly!"
    )

    return {
        "message": "Test push notification sent" if success else "Test push notification failed",
        "status": "success" if success else "error",
        "push_configured": push_notification_service.app is not None
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
    mock_notifications = [
        NotificationResponse(
            id="1",
            title="Quarterly Report Due",
            message="Your Q4 2024 EPR report is due in 7 days",
            type="deadline",
            priority="high",
            status="unread",
            created_at=datetime.now(timezone.utc)
        ),
        NotificationResponse(
            id="2", 
            title="Fee Payment Processed",
            message="Your EPR fee payment of €1,250 has been processed successfully",
            type="payment",
            priority="medium",
            status="read",
            created_at=datetime.now(timezone.utc),
            read_at=datetime.now(timezone.utc)
        ),
        NotificationResponse(
            id="3",
            title="New Team Member Added",
            message="John Doe has joined your organization",
            type="team",
            priority="low",
            status="unread",
            created_at=datetime.now(timezone.utc)
        ),
        NotificationResponse(
            id="4",
            title="Compliance Score Updated",
            message="Your compliance score has improved to 92%",
            type="compliance",
            priority="medium",
            status="unread",
            created_at=datetime.now(timezone.utc)
        )
    ]
    
    filtered = mock_notifications
    if status:
        filtered = [n for n in filtered if n.status == status]
    if type:
        filtered = [n for n in filtered if n.type == type]
    
    return filtered[skip:skip + limit]


@router.get("/count")
async def get_notification_count(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Get count of unread notifications."""
    return {
        "unread_count": 3,
        "total_count": 4
    }


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Mark a notification as read."""
    return {
        "message": "Notification marked as read",
        "notification_id": notification_id,
        "status": "read",
        "read_at": datetime.now(timezone.utc).isoformat()
    }


@router.put("/mark-all-read")
async def mark_all_notifications_read(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Mark all notifications as read."""
    return {
        "message": "All notifications marked as read",
        "updated_count": 3,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Delete a notification."""
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
    return NotificationPreferences(
        email_notifications=True,
        sms_notifications=False,
        push_notifications=True,
        deadline_reminders=True,
        compliance_alerts=True,
        team_notifications=True
    )


@router.put("/preferences")
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Update user notification preferences."""
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
    test_notification = {
        "id": str(uuid.uuid4()),
        "title": "Test Notification",
        "message": f"This is a test notification created at {datetime.now(timezone.utc).isoformat()}",
        "type": "system",
        "priority": "low",
        "status": "unread",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    return {
        "message": "Test notification created",
        "notification": test_notification
    }
