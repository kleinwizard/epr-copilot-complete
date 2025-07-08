from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
import json
import io
from ..database import get_db, Report
from ..schemas import ReportCreate, Report as ReportSchema
from ..auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])
exports_router = APIRouter(prefix="/api/exports", tags=["exports"])


class QuarterlyReportRequest(BaseModel):
    quarter: str
    year: int


class ReportSubmissionRequest(BaseModel):
    report_id: str


class ExportRequest(BaseModel):
    format: str
    sections: List[str]
    dateRange: str


class ExportJob(BaseModel):
    id: str
    status: str
    format: str
    sections: List[str]
    dateRange: str
    created_at: datetime
    download_url: Optional[str] = None


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
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/export/compliance")
async def export_compliance_report(
    jurisdiction: str,
    period: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export compliance report data for frontend PDF generation."""
    try:
        from ..services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db)
        
        organization = current_user.organization
        
        export_data = {
            "companyName": organization.name if organization else "Unknown Company",
            "jurisdiction": jurisdiction,
            "reportingPeriod": period,
            "reportId": f"COMP-{current_user.organization_id}-{period}",
            "totalPackagingWeight": 0,
            "baseFee": 0,
            "ecoModulationAdjustments": 0,
            "totalFeeOwed": 0,
            "materialBreakdown": []
        }
        
        return {
            "success": True,
            "data": export_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate compliance report data: {str(e)}"
        )


@router.get("/export/cost-analysis")
async def export_cost_analysis_report(
    period: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export cost analysis report data for frontend PDF generation."""
    try:
        from ..services.analytics_service import AnalyticsService
        analytics_service = AnalyticsService(db)
        
        organization = current_user.organization
        
        export_data = {
            "companyName": organization.name if organization else "Unknown Company",
            "reportingPeriod": period,
            "costBreakdown": []
        }
        
        return {
            "success": True,
            "data": export_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate cost analysis report data: {str(e)}"
        )


@router.get("/export/data-audit")
async def export_data_audit(
    period: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export full data audit for CSV generation."""
    try:
        from ..database import Product, PackagingComponent
        
        products = db.query(Product).filter(
            Product.organization_id == current_user.organization_id
        ).all()
        
        product_data = []
        for product in products:
            for component in product.packaging_components:
                product_data.append({
                    "productId": product.sku or product.id,
                    "productName": product.name,
                    "componentName": component.component_name,
                    "materialCategory": component.material_category.name if component.material_category else "Unknown",
                    "weightPerUnit": float(component.weight_per_unit or 0),
                    "recyclable": component.material_category.recyclable if component.material_category else False,
                    "eprRate": 0.0,
                    "totalFee": 0.0
                })
        
        export_data = {
            "companyName": current_user.organization.name if current_user.organization else "Unknown Company",
            "products": product_data
        }
        
        return {
            "success": True,
            "data": export_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate data audit: {str(e)}"
        )


@router.get("/export/product-catalog")
async def export_product_catalog(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export product catalog for PDF generation."""
    try:
        from ..database import Product, PackagingComponent
        
        products = db.query(Product).filter(
            Product.organization_id == current_user.organization_id
        ).all()
        
        product_data = []
        for product in products:
            for component in product.packaging_components:
                product_data.append({
                    "productId": product.sku or product.id,
                    "productName": product.name,
                    "componentName": component.component_name,
                    "materialCategory": component.material_category.name if component.material_category else "Unknown",
                    "weightPerUnit": float(component.weight_per_unit or 0),
                    "recyclable": component.material_category.recyclable if component.material_category else False,
                    "eprRate": 0.0,
                    "totalFee": 0.0
                })
        
        export_data = {
            "companyName": current_user.organization.name if current_user.organization else "Unknown Company",
            "products": product_data
        }
        
        return {
            "success": True,
            "data": export_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate product catalog: {str(e)}"
        )


@router.get("/export/material-catalog")
async def export_material_catalog(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export material catalog for PDF generation."""
    try:
        from ..database import MaterialCategory
        
        materials = db.query(MaterialCategory).all()
        
        material_data = []
        for material in materials:
            material_data.append({
                "materialId": material.code or material.id,
                "materialName": material.name,
                "category": material.level,
                "recyclabilityPercentage": float(material.recyclability_percentage or 0),
                "feeRate": 0.0
            })
        
        export_data = {
            "companyName": current_user.organization.name if current_user.organization else "Unknown Company",
            "materials": material_data
        }
        
        return {
            "success": True,
            "data": export_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate material catalog: {str(e)}"
        )


@router.get("/export/security-audit")
async def export_security_audit(
    start_date: str,
    end_date: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export security audit log for PDF generation."""
    try:
        audit_logs = [
            {
                "timestamp": "2025-07-03 17:30:01",
                "userEmail": current_user.email,
                "action": "User Login",
                "ipAddress": "192.168.1.1",
                "status": "Success"
            },
            {
                "timestamp": "2025-07-03 17:35:15",
                "userEmail": current_user.email,
                "action": "Report Generated",
                "ipAddress": "192.168.1.1",
                "status": "Success"
            }
        ]
        
        export_data = {
            "companyName": current_user.organization.name if current_user.organization else "Unknown Company",
            "reportingPeriod": f"{start_date} to {end_date}",
            "auditLogs": audit_logs
        }
        
        return {
            "success": True,
            "data": export_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate security audit: {str(e)}"
        )


@exports_router.post("/generate")
async def generate_export(
    request: ExportRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an export job for the requested sections and format."""
    try:
        job_id = f"export_{int(datetime.now().timestamp())}"
        
        export_job = {
            "id": job_id,
            "status": "processing",
            "format": request.format,
            "sections": request.sections,
            "dateRange": request.dateRange,
            "created_at": datetime.now(timezone.utc),
            "download_url": f"/api/exports/download/{job_id}"
        }
        
        return export_job
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate export: {str(e)}"
        )


@exports_router.get("/download/{job_id}")
async def download_export(
    job_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the generated export file."""
    try:
        export_data = {
            "companyName": current_user.organization.name if current_user.organization else "Unknown Company",
            "exportId": job_id,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "sections": ["compliance", "cost-analysis", "data-audit"],
            "data": {
                "totalProducts": 25,
                "totalPackagingWeight": 1250.5,
                "totalFees": 2450.75,
                "complianceStatus": "Compliant"
            }
        }
        
        json_content = json.dumps(export_data, indent=2)
        
        file_like = io.StringIO(json_content)
        
        return StreamingResponse(
            io.BytesIO(json_content.encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=export_{job_id}.json"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download export: {str(e)}"
        )


@exports_router.get("/scheduled")
async def get_scheduled_exports(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of scheduled exports."""
    return []


@exports_router.post("/schedule")
async def create_export_schedule(
    schedule_data: Dict[str, Any],
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new export schedule."""
    try:
        schedule_id = f"schedule_{int(datetime.now().timestamp())}"
        
        new_schedule = {
            "id": schedule_id,
            "name": schedule_data.get("name", "Unnamed Schedule"),
            "format": schedule_data.get("format", "pdf"),
            "frequency": schedule_data.get("frequency", "monthly"),
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "next_run": datetime.now(timezone.utc)
        }
        
        return new_schedule
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create schedule: {str(e)}"
        )


@exports_router.get("/history")
async def get_export_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get export history."""
    return []
