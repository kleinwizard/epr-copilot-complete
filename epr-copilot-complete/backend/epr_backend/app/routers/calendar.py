from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from ..database import get_db, CalendarEvent
from ..auth import get_current_user
from ..schemas import User as UserSchema

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


class CalendarEventRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    date: datetime
    type: str
    priority: str = "medium"
    category: str = "data-submission"
    jurisdiction: Optional[str] = None
    reminderDays: Optional[List[int]] = [7, 3, 1]


class CalendarEventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: datetime
    type: str
    status: str
    priority: str
    category: str
    jurisdiction: Optional[str]
    reminderDays: List[int]


@router.get("/events")
async def get_calendar_events(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[CalendarEventResponse]:
    """Get calendar events for the current organization."""
    try:
        if not current_user.organization_id:
            return []
        
        query = db.query(CalendarEvent).filter(
            CalendarEvent.organization_id == current_user.organization_id
        )
        
        if month is not None and year is not None:
            query = query.filter(
                CalendarEvent.start_date.between(
                    datetime(year, month, 1),
                    datetime(year, month + 1, 1) if month < 12 else datetime(year + 1, 1, 1)
                )
            )
        
        events = query.order_by(CalendarEvent.start_date).all()
        
        return [
            CalendarEventResponse(
                id=event.id,
                title=event.title,
                description=event.description or "",
                date=event.start_date,
                type=event.event_type,
                status=event.status,
                priority=event.priority,
                category="data-submission",
                jurisdiction=event.jurisdiction.name if event.jurisdiction else None,
                reminderDays=event.reminder_settings.get("days", [7, 3, 1]) if event.reminder_settings else [7, 3, 1]
            )
            for event in events
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve calendar events: {str(e)}"
        )


@router.post("/events")
async def create_calendar_event(
    request: CalendarEventRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> CalendarEventResponse:
    """Create a new calendar event."""
    try:
        if not current_user.organization_id:
            raise HTTPException(
                status_code=400,
                detail="User must be part of an organization to create events"
            )
        
        new_event = CalendarEvent(
            organization_id=current_user.organization_id,
            title=request.title,
            description=request.description,
            start_date=request.date,
            event_type=request.type,
            status="scheduled",
            priority=request.priority,
            reminder_settings={"days": request.reminderDays},
            created_by=current_user.id,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(new_event)
        db.commit()
        db.refresh(new_event)
        
        return CalendarEventResponse(
            id=new_event.id,
            title=new_event.title,
            description=new_event.description or "",
            date=new_event.start_date,
            type=new_event.event_type,
            status=new_event.status,
            priority=new_event.priority,
            category="data-submission",
            jurisdiction=new_event.jurisdiction.name if new_event.jurisdiction else None,
            reminderDays=new_event.reminder_settings.get("days", [7, 3, 1]) if new_event.reminder_settings else [7, 3, 1]
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create calendar event: {str(e)}"
        )


@router.get("/events/upcoming")
async def get_upcoming_events(
    days: int = 30,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[CalendarEventResponse]:
    """Get upcoming events within the specified number of days."""
    try:
        if not current_user.organization_id:
            return []
        
        now = datetime.now(timezone.utc)
        future_date = datetime.now(timezone.utc).replace(
            day=now.day + days if now.day + days <= 31 else 31
        )
        
        events = db.query(CalendarEvent).filter(
            CalendarEvent.organization_id == current_user.organization_id,
            CalendarEvent.start_date >= now,
            CalendarEvent.start_date <= future_date
        ).order_by(CalendarEvent.start_date).all()
        
        return [
            CalendarEventResponse(
                id=event.id,
                title=event.title,
                description=event.description or "",
                date=event.start_date,
                type=event.event_type,
                status=event.status,
                priority=event.priority,
                category="data-submission",
                jurisdiction=event.jurisdiction.name if event.jurisdiction else None,
                reminderDays=event.reminder_settings.get("days", [7, 3, 1]) if event.reminder_settings else [7, 3, 1]
            )
            for event in events
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve upcoming events: {str(e)}"
        )


@router.get("/stats")
async def get_calendar_stats(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, int]:
    """Get calendar statistics."""
    try:
        if not current_user.organization_id:
            return {"upcoming": 0, "overdue": 0, "completed": 0, "critical": 0}
        
        now = datetime.now(timezone.utc)
        
        upcoming = db.query(CalendarEvent).filter(
            CalendarEvent.organization_id == current_user.organization_id,
            CalendarEvent.start_date >= now,
            CalendarEvent.status == "scheduled"
        ).count()
        
        overdue = db.query(CalendarEvent).filter(
            CalendarEvent.organization_id == current_user.organization_id,
            CalendarEvent.start_date < now,
            CalendarEvent.status != "completed"
        ).count()
        
        completed = db.query(CalendarEvent).filter(
            CalendarEvent.organization_id == current_user.organization_id,
            CalendarEvent.status == "completed"
        ).count()
        
        critical = db.query(CalendarEvent).filter(
            CalendarEvent.organization_id == current_user.organization_id,
            CalendarEvent.priority == "critical",
            CalendarEvent.status == "scheduled"
        ).count()
        
        return {
            "upcoming": upcoming,
            "overdue": overdue,
            "completed": completed,
            "critical": critical
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve calendar stats: {str(e)}"
        )


@router.put("/events/{event_id}/status")
async def update_event_status(
    event_id: str,
    status: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> CalendarEventResponse:
    """Update the status of a calendar event."""
    try:
        event = db.query(CalendarEvent).filter(
            CalendarEvent.id == event_id,
            CalendarEvent.organization_id == current_user.organization_id
        ).first()
        
        if not event:
            raise HTTPException(
                status_code=404,
                detail="Calendar event not found"
            )
        
        event.status = status
        db.commit()
        db.refresh(event)
        
        return CalendarEventResponse(
            id=event.id,
            title=event.title,
            description=event.description or "",
            date=event.start_date,
            type=event.event_type,
            status=event.status,
            priority=event.priority,
            category="data-submission",
            jurisdiction=event.jurisdiction.name if event.jurisdiction else None,
            reminderDays=event.reminder_settings.get("days", [7, 3, 1]) if event.reminder_settings else [7, 3, 1]
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update event status: {str(e)}"
        )
