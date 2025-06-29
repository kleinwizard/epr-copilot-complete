from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from ..database import get_db, Report
from ..schemas import ReportCreate, Report as ReportSchema
from ..auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


class QuarterlyReportRequest(BaseModel):
    quarter: str
    year: int


class ReportSubmissionRequest(BaseModel):
    report_id: str


@router.get("/", response_model=List[ReportSchema])
async def get_reports(
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all reports for the current user's organization."""
    reports = db.query(Report).filter(
        Report.organization_id == current_user.organization_id
    ).offset(skip).limit(limit).all()
    return reports


@router.post("/generate", response_model=ReportSchema)
async def generate_report(
    request: QuarterlyReportRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new quarterly report."""
    report_id = f"{request.quarter}-{request.year}"

    existing_report = db.query(Report).filter(
        Report.organization_id == current_user.organization_id,
        Report.type == "quarterly",
        Report.period == report_id
    ).first()

    if existing_report:
        raise HTTPException(status_code=400,
                            detail="Report already exists for this period")

    db_report = Report(
        organization_id=current_user.organization_id,
        type="quarterly",
        period=report_id,
        status="draft",
        total_fee=0.0
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@router.get("/{report_id}", response_model=ReportSchema)
async def get_report(
    report_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific report."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.organization_id == current_user.organization_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/{report_id}/submit")
async def submit_report(
    report_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a report for regulatory compliance."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.organization_id == current_user.organization_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.status != "draft":
        raise HTTPException(status_code=400,
                            detail="Only draft reports can be submitted")

    report.status = "submitted"
    db.commit()
    db.refresh(report)

    return {"message": "Report submitted successfully", "report": report}


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    format: str = "pdf",
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a report in the specified format."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.organization_id == current_user.organization_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "download_url": f"/files/reports/{report_id}.{format}",
        "format": format,
        "generated_at": datetime.utcnow().isoformat()
    }
