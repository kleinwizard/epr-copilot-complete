from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import uuid
import logging

from ..database import get_db
from ..auth import get_current_user
from ..schemas import User as UserSchema

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/exports", tags=["exports"])


class ExportRequest(BaseModel):
    format: str
    sections: List[str]
    dateRange: str


class ScheduledExport(BaseModel):
    name: str
    format: str
    frequency: str


@router.post("/generate")
async def generate_export(
    request: ExportRequest,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an export job."""
    try:
        job_id = str(uuid.uuid4())
        
        export_job = {
            "id": job_id,
            "status": "completed",
            "format": request.format,
            "sections": request.sections,
            "dateRange": request.dateRange,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "downloadUrl": f"/api/exports/download/{job_id}"
        }
        
        return export_job
        
    except Exception as e:
        logger.error(f"Failed to generate export: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate export. Please try again."
        )


@router.get("/download/{job_id}")
async def download_export(
    job_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download export file."""
    return {
        "message": "Export download endpoint",
        "jobId": job_id,
        "note": "In production, this would return file data"
    }


@router.get("/scheduled")
async def get_scheduled_exports(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get scheduled exports."""
    return [
        {
            "id": "sched-1",
            "name": "Monthly Compliance Report",
            "format": "pdf",
            "schedule": "Monthly",
            "lastRun": (datetime.now(timezone.utc) -
                        timedelta(days=30)).isoformat(),
            "nextRun": (datetime.now(timezone.utc) +
                        timedelta(days=1)).isoformat(),
            "status": "active"
        }
    ]


@router.get("/history")
async def get_export_history(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get export history."""
    history = []
    for i in range(5):
        history.append({
            "id": f"export-{i}",
            "reportName": f"Q{4-i} 2024 Report",
            "format": "PDF" if i % 2 == 0 else "CSV",
            "size": f"{10 + i * 2}.{i} MB",
            "exportedAt": (datetime.now(timezone.utc) -
                           timedelta(days=i * 7)).isoformat(),
            "exportedBy": current_user.email,
            "status": "completed"
        })
    
    return history


@router.post("/schedule")
async def create_scheduled_export(
    schedule: ScheduledExport,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a scheduled export."""
    try:
        return {
            "id": str(uuid.uuid4()),
            "name": schedule.name,
            "format": schedule.format,
            "frequency": schedule.frequency,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
    except Exception as e:
        logger.error(f"Failed to create scheduled export: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create scheduled export."
        )
