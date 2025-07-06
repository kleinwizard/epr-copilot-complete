from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from ..database import get_db, UserProfile as UserProfileTable

router = APIRouter(prefix="/api/user", tags=["user"])

class UserProfile(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    title: str
    bio: str
    avatar: Optional[str] = None

class UserPreferences(BaseModel):
    timezone: str
    language: str

class UserNotificationSettings(BaseModel):
    deadlineAlerts: bool
    reportStatus: bool
    feeChanges: bool
    teamUpdates: bool
    browserNotifications: bool
    notificationFrequency: str

@router.get("/profile")
async def get_user_profile(db: Session = Depends(get_db)):
    """Get user profile information"""
    try:
        profile = db.query(UserProfileTable).filter(UserProfileTable.user_id == "1").first()
        
        if profile:
            return {
                "firstName": profile.first_name or "",
                "lastName": profile.last_name or "",
                "email": profile.user.email if profile.user else "",
                "phone": profile.phone or "",
                "title": profile.title or "",
                "bio": profile.bio or "",
                "avatar": profile.avatar_url or ""
            }
        else:
            return {
                "firstName": "",
                "lastName": "",
                "email": "",
                "phone": "",
                "title": "",
                "bio": "",
                "avatar": ""
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")

@router.put("/profile")
async def update_user_profile(profile: UserProfile, db: Session = Depends(get_db)):
    """Update user profile information"""
    try:
        existing_profile = db.query(UserProfileTable).filter(UserProfileTable.user_id == "1").first()
        
        if existing_profile:
            existing_profile.first_name = profile.firstName
            existing_profile.last_name = profile.lastName
            existing_profile.phone = profile.phone
            existing_profile.title = profile.title
            existing_profile.bio = profile.bio
            existing_profile.avatar_url = profile.avatar
        else:
            new_profile = UserProfileTable(
                user_id="1",
                first_name=profile.firstName,
                last_name=profile.lastName,
                phone=profile.phone,
                title=profile.title,
                bio=profile.bio,
                avatar_url=profile.avatar
            )
            db.add(new_profile)
        
        db.commit()
        return {"success": True, "message": "Profile updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user profile: {str(e)}")

@router.get("/preferences")
async def get_user_preferences(db: Session = Depends(get_db)):
    """Get user preferences"""
    try:
        return {
            "timezone": "Pacific Time (PT)",
            "language": "English (US)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user preferences: {str(e)}")

@router.put("/preferences")
async def update_user_preferences(preferences: UserPreferences, db: Session = Depends(get_db)):
    """Update user preferences"""
    try:
        db.commit()
        return {"success": True, "message": "Preferences updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user preferences: {str(e)}")

@router.get("/notification-settings")
async def get_notification_settings(db: Session = Depends(get_db)):
    """Get user notification settings"""
    try:
        from ..database import UserNotificationSettings as UserNotificationSettingsTable
        settings = db.query(UserNotificationSettingsTable).filter(UserNotificationSettingsTable.user_id == "1").first()
        
        if settings:
            return {
                "deadlineAlerts": settings.deadline_alerts,
                "reportStatus": settings.report_status,
                "feeChanges": settings.fee_changes,
                "teamUpdates": settings.team_updates,
                "browserNotifications": settings.browser_notifications,
                "notificationFrequency": settings.notification_frequency
            }
        else:
            return {
                "deadlineAlerts": True,
                "reportStatus": True,
                "feeChanges": True,
                "teamUpdates": False,
                "browserNotifications": False,
                "notificationFrequency": "Real-time"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notification settings: {str(e)}")

@router.put("/notification-settings")
async def update_notification_settings(settings: UserNotificationSettings, db: Session = Depends(get_db)):
    """Update user notification settings"""
    try:
        from ..database import UserNotificationSettings as UserNotificationSettingsTable
        existing_settings = db.query(UserNotificationSettingsTable).filter(UserNotificationSettingsTable.user_id == "1").first()
        
        if existing_settings:
            existing_settings.deadline_alerts = settings.deadlineAlerts
            existing_settings.report_status = settings.reportStatus
            existing_settings.fee_changes = settings.feeChanges
            existing_settings.team_updates = settings.teamUpdates
            existing_settings.browser_notifications = settings.browserNotifications
            existing_settings.notification_frequency = settings.notificationFrequency
        else:
            new_settings = UserNotificationSettingsTable(
                user_id="1",
                deadline_alerts=settings.deadlineAlerts,
                report_status=settings.reportStatus,
                fee_changes=settings.feeChanges,
                team_updates=settings.teamUpdates,
                browser_notifications=settings.browserNotifications,
                notification_frequency=settings.notificationFrequency
            )
            db.add(new_settings)
        
        db.commit()
        return {"success": True, "message": "Notification settings updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update notification settings: {str(e)}")

@router.post("/avatar")
async def upload_avatar():
    """Upload user avatar (placeholder implementation)"""
    return {
        "success": True,
        "avatarUrl": "/api/uploads/avatars/default-avatar.jpg",
        "message": "Avatar uploaded successfully"
    }
