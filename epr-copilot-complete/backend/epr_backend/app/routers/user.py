from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from ..database import get_db, Base, engine
from sqlalchemy import Column, String, Integer

router = APIRouter(prefix="/api/user", tags=["user"])

class UserProfileTable(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, default=1)
    first_name = Column(String(255))
    last_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    title = Column(String(255))
    bio = Column(String(1000))
    avatar = Column(String(500))

class UserPreferencesTable(Base):
    __tablename__ = "user_preferences"
    
    user_id = Column(Integer, primary_key=True, default=1)
    timezone = Column(String(100))
    language = Column(String(50))

Base.metadata.create_all(bind=engine)

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

@router.get("/profile")
async def get_user_profile(db: Session = Depends(get_db)):
    """Get user profile information"""
    try:
        profile = db.query(UserProfileTable).filter(UserProfileTable.id == 1).first()
        
        if profile:
            return {
                "firstName": profile.first_name or "",
                "lastName": profile.last_name or "",
                "email": profile.email or "",
                "phone": profile.phone or "",
                "title": profile.title or "",
                "bio": profile.bio or "",
                "avatar": profile.avatar or ""
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
        existing_profile = db.query(UserProfileTable).filter(UserProfileTable.id == 1).first()
        
        if existing_profile:
            existing_profile.first_name = profile.firstName
            existing_profile.last_name = profile.lastName
            existing_profile.email = profile.email
            existing_profile.phone = profile.phone
            existing_profile.title = profile.title
            existing_profile.bio = profile.bio
            existing_profile.avatar = profile.avatar
        else:
            new_profile = UserProfileTable(
                id=1,
                first_name=profile.firstName,
                last_name=profile.lastName,
                email=profile.email,
                phone=profile.phone,
                title=profile.title,
                bio=profile.bio,
                avatar=profile.avatar
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
        preferences = db.query(UserPreferencesTable).filter(UserPreferencesTable.user_id == 1).first()
        
        if preferences:
            return {
                "timezone": preferences.timezone or "Pacific Time (PT)",
                "language": preferences.language or "English (US)"
            }
        else:
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
        existing_preferences = db.query(UserPreferencesTable).filter(UserPreferencesTable.user_id == 1).first()
        
        if existing_preferences:
            existing_preferences.timezone = preferences.timezone
            existing_preferences.language = preferences.language
        else:
            new_preferences = UserPreferencesTable(
                user_id=1,
                timezone=preferences.timezone,
                language=preferences.language
            )
            db.add(new_preferences)
        
        db.commit()
        return {"success": True, "message": "Preferences updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user preferences: {str(e)}")

@router.post("/avatar")
async def upload_avatar():
    """Upload user avatar (placeholder implementation)"""
    return {
        "success": True,
        "avatarUrl": "/api/uploads/avatars/default-avatar.jpg",
        "message": "Avatar uploaded successfully"
    }
