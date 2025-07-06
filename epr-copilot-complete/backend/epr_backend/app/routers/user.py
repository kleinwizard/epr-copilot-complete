from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from ..database import get_db, UserProfile as UserProfileTable
from ..auth import get_current_user
from ..schemas import User as UserSchema
import os
import uuid
from pathlib import Path

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
async def get_user_profile(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile information"""
    try:
        profile = db.query(UserProfileTable).filter(UserProfileTable.user_id == current_user.id).first()
        
        if profile:
            return {
                "firstName": profile.first_name or "",
                "lastName": profile.last_name or "",
                "email": current_user.email,
                "phone": profile.phone or "",
                "title": profile.title or "",
                "bio": profile.bio or "",
                "avatar": profile.avatar_url or ""
            }
        else:
            return {
                "firstName": "",
                "lastName": "",
                "email": current_user.email,
                "phone": "",
                "title": "",
                "bio": "",
                "avatar": ""
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")

@router.put("/profile")
async def update_user_profile(
    profile: UserProfile,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    try:
        existing_profile = db.query(UserProfileTable).filter(UserProfileTable.user_id == current_user.id).first()
        
        if existing_profile:
            existing_profile.first_name = profile.firstName
            existing_profile.last_name = profile.lastName
            existing_profile.phone = profile.phone
            existing_profile.title = profile.title
            existing_profile.bio = profile.bio
            if profile.avatar:
                existing_profile.avatar_url = profile.avatar
        else:
            new_profile = UserProfileTable(
                user_id=current_user.id,
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
async def get_notification_settings(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user notification settings"""
    try:
        from ..database import UserNotificationSettings as UserNotificationSettingsTable
        settings = db.query(UserNotificationSettingsTable).filter(UserNotificationSettingsTable.user_id == current_user.id).first()
        
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
async def update_notification_settings(
    settings: UserNotificationSettings,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user notification settings"""
    try:
        from ..database import UserNotificationSettings as UserNotificationSettingsTable
        existing_settings = db.query(UserNotificationSettingsTable).filter(UserNotificationSettingsTable.user_id == current_user.id).first()
        
        if existing_settings:
            existing_settings.deadline_alerts = settings.deadlineAlerts
            existing_settings.report_status = settings.reportStatus
            existing_settings.fee_changes = settings.feeChanges
            existing_settings.team_updates = settings.teamUpdates
            existing_settings.browser_notifications = settings.browserNotifications
            existing_settings.notification_frequency = settings.notificationFrequency
        else:
            new_settings = UserNotificationSettingsTable(
                user_id=current_user.id,
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
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar"""
    try:
        if not avatar.content_type or not avatar.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        if avatar.size and avatar.size > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
        
        uploads_dir = Path("uploads/avatars")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        file_extension = avatar.filename.split('.')[-1] if avatar.filename and '.' in avatar.filename else 'jpg'
        filename = f"{current_user.id}_{uuid.uuid4().hex}.{file_extension}"
        file_path = uploads_dir / filename
        
        with open(file_path, "wb") as buffer:
            content = await avatar.read()
            buffer.write(content)
        
        avatar_url = f"/api/uploads/avatars/{filename}"
        
        profile = db.query(UserProfileTable).filter(UserProfileTable.user_id == current_user.id).first()
        if profile:
            profile.avatar_url = avatar_url
        else:
            new_profile = UserProfileTable(
                user_id=current_user.id,
                avatar_url=avatar_url
            )
            db.add(new_profile)
        
        db.commit()
        
        return {
            "success": True,
            "avatarUrl": avatar_url,
            "message": "Avatar uploaded successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")
