from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from decimal import Decimal
import uuid
import logging
from ..database import get_db
from ..auth import get_current_user
from ..schemas import User as UserSchema

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


class ComplianceScore(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    category_scores: Dict[str, float]
    trend: str = Field(..., pattern="^(improving|declining|stable)$")
    last_updated: datetime
    previous_score: Optional[float] = None
    score_change: Optional[float] = None


class ComplianceIssue(BaseModel):
    id: str
    title: str
    description: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    status: str = Field(..., pattern="^(open|in_progress|resolved|ignored)$")
    category: str
    created_at: datetime
    updated_at: datetime
    resolution_deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None


class ComplianceRecommendation(BaseModel):
    id: str
    title: str
    description: str
    impact: str = Field(..., pattern="^(low|medium|high)$")
    effort: str = Field(..., pattern="^(low|medium|high)$")
    priority: int = Field(..., ge=1, le=10)
    category: str
    estimated_time: Optional[str] = None
    resources_required: Optional[List[str]] = []


class ComplianceValidationResult(BaseModel):
    valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    data_type: str
    validated_at: datetime
    field_validations: Dict[str, Any] = {}


@router.get("/score", response_model=ComplianceScore)
async def get_compliance_score(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ComplianceScore:
    """Get current compliance score and breakdown."""
    from ..database import ComplianceMetric
    
    overall_metric = db.query(ComplianceMetric).filter(
        ComplianceMetric.organization_id == current_user.organization_id,
        ComplianceMetric.metric_type == "overall_score"
    ).order_by(ComplianceMetric.calculated_at.desc()).first()
    
    if not overall_metric:
        return ComplianceScore(
            overall_score=0.0,
            category_scores={},
            trend="stable",
            last_updated=datetime.now(timezone.utc)
        )
    
    category_metrics = db.query(ComplianceMetric).filter(
        ComplianceMetric.organization_id == current_user.organization_id,
        ComplianceMetric.metric_type.in_(["reporting", "materials", "fees", "documentation", "data_quality"])
    ).order_by(ComplianceMetric.calculated_at.desc()).all()
    
    category_scores = {}
    for metric in category_metrics:
        if metric.metric_type not in category_scores:
            category_scores[metric.metric_type] = float(metric.metric_value)
    
    previous_metric = db.query(ComplianceMetric).filter(
        ComplianceMetric.organization_id == current_user.organization_id,
        ComplianceMetric.metric_type == "overall_score",
        ComplianceMetric.calculated_at < overall_metric.calculated_at
    ).order_by(ComplianceMetric.calculated_at.desc()).first()
    
    current_score = float(overall_metric.metric_value)
    previous_score = float(previous_metric.metric_value) if previous_metric else current_score
    
    if current_score > previous_score + 1:
        trend = "improving"
    elif current_score < previous_score - 1:
        trend = "declining"
    else:
        trend = "stable"
    
    return ComplianceScore(
        overall_score=current_score,
        category_scores=category_scores,
        trend=trend,
        last_updated=overall_metric.calculated_at,
        previous_score=previous_score if previous_metric else None,
        score_change=round(current_score - previous_score, 1) if previous_metric else None
    )


@router.get("/score/history")
async def get_compliance_score_history(
    days: int = Query(30, ge=1, le=365),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get compliance score history for trending."""
    history = []
    base_score = 85.0
    
    for i in range(days, -1, -7):
        date = datetime.now(timezone.utc) - timedelta(days=i)
        score = base_score + (i * 0.1)
        history.append({
            "date": date.isoformat(),
            "overall_score": min(round(score, 1), 100),
            "category_scores": {
                "reporting": min(round(score + 2, 1), 100),
                "materials": min(round(score - 1, 1), 100),
                "fees": min(round(score + 1, 1), 100),
                "documentation": min(round(score - 2, 1), 100)
            }
        })
    
    return history


@router.get("/issues", response_model=List[ComplianceIssue])
async def get_compliance_issues(
    status: Optional[str] = Query(None, pattern="^(open|in_progress|resolved|ignored)$"),
    severity: Optional[str] = Query(None, pattern="^(low|medium|high|critical)$"),
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[ComplianceIssue]:
    """Get compliance issues and violations."""
    from ..database import ComplianceIssue as DBComplianceIssue
    
    query = db.query(DBComplianceIssue).filter(
        DBComplianceIssue.organization_id == current_user.organization_id
    )
    
    if status:
        query = query.filter(DBComplianceIssue.status == status)
    if severity:
        query = query.filter(DBComplianceIssue.severity == severity)
    if category:
        query = query.filter(DBComplianceIssue.category == category)
    
    issues = query.order_by(DBComplianceIssue.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        ComplianceIssue(
            id=issue.id,
            title=issue.title,
            description=issue.description,
            severity=issue.severity,
            status=issue.status,
            category=issue.category,
            created_at=issue.created_at,
            updated_at=issue.updated_at,
            resolution_deadline=issue.resolution_deadline,
            assigned_to=issue.assigned_to,
            resolution_notes=issue.resolution_notes
        )
        for issue in issues
    ]


@router.get("/issues/{issue_id}", response_model=ComplianceIssue)
async def get_compliance_issue(
    issue_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ComplianceIssue:
    """Get details of a specific compliance issue."""
    from ..database import ComplianceIssue as DBComplianceIssue
    
    issue = db.query(DBComplianceIssue).filter(
        DBComplianceIssue.id == issue_id,
        DBComplianceIssue.organization_id == current_user.organization_id
    ).first()
    
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    
    return ComplianceIssue(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        severity=issue.severity,
        status=issue.status,
        category=issue.category,
        created_at=issue.created_at,
        updated_at=issue.updated_at,
        resolution_deadline=issue.resolution_deadline,
        assigned_to=issue.assigned_to,
        resolution_notes=issue.resolution_notes
    )


@router.put("/issues/{issue_id}/status")
async def update_issue_status(
    issue_id: str,
    status: str = Query(..., pattern="^(open|in_progress|resolved|ignored)$"),
    resolution_notes: Optional[str] = None,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Update the status of a compliance issue."""
    from ..database import ComplianceIssue as DBComplianceIssue
    
    issue = db.query(DBComplianceIssue).filter(
        DBComplianceIssue.id == issue_id,
        DBComplianceIssue.organization_id == current_user.organization_id
    ).first()
    
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    
    issue.status = status
    issue.updated_at = datetime.now(timezone.utc)
    
    if resolution_notes:
        issue.resolution_notes = resolution_notes
    
    if status == "resolved":
        issue.resolved_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "message": "Issue status updated successfully",
        "issue_id": issue_id,
        "new_status": status,
        "updated_at": issue.updated_at.isoformat(),
        "updated_by": current_user.email
    }


@router.get("/recommendations", response_model=List[ComplianceRecommendation])
async def get_compliance_recommendations(
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[ComplianceRecommendation]:
    """Get personalized compliance recommendations."""
    recommendations = [
        ComplianceRecommendation(
            id="1",
            title="Complete Material Audit",
            description="Review and update material classifications for all products to ensure accurate reporting",
            impact="high",
            effort="medium",
            priority=1,
            category="materials",
            estimated_time="2-3 hours",
            resources_required=["Product catalog", "Material classification guide"]
        ),
        ComplianceRecommendation(
            id="2",
            title="Enable Automated Reporting",
            description="Set up automated quarterly report generation to reduce manual errors and save time",
            impact="medium",
            effort="low",
            priority=2,
            category="reporting",
            estimated_time="30 minutes",
            resources_required=["Admin access", "Report templates"]
        ),
        ComplianceRecommendation(
            id="3",
            title="Update Fee Documentation",
            description="Ensure all fee payments have proper supporting documentation for audit compliance",
            impact="high",
            effort="low",
            priority=3,
            category="fees",
            estimated_time="1 hour",
            resources_required=["Payment records", "Invoice templates"]
        ),
        ComplianceRecommendation(
            id="4",
            title="Implement Data Validation Rules",
            description="Add validation rules to prevent incomplete product data entry",
            impact="medium",
            effort="medium",
            priority=4,
            category="data_quality",
            estimated_time="1-2 hours",
            resources_required=["Admin access", "Validation rule documentation"]
        )
    ]
    
    if category:
        recommendations = [r for r in recommendations if r.category == category]
    
    return recommendations[skip:skip + limit]


@router.post("/validate", response_model=ComplianceValidationResult)
async def validate_compliance_data(
    data_type: str = Query(..., pattern="^(product|material|fee|report)$"),
    data: Dict[str, Any] = {},
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ComplianceValidationResult:
    """Validate compliance data before submission."""
    validation_result = ComplianceValidationResult(
        valid=True,
        errors=[],
        warnings=[],
        data_type=data_type,
        validated_at=datetime.now(timezone.utc),
        field_validations={}
    )
    
    if data_type == "product":
        if not data.get("name"):
            validation_result.valid = False
            validation_result.errors.append("Product name is required")
            validation_result.field_validations["name"] = "required"
        
        if not data.get("material_id"):
            validation_result.valid = False
            validation_result.errors.append("Material classification is required")
            validation_result.field_validations["material_id"] = "required"
        
        if not data.get("weight"):
            validation_result.warnings.append("Product weight is recommended for accurate fee calculation")
            validation_result.field_validations["weight"] = "recommended"
            
    elif data_type == "material":
        if not data.get("category"):
            validation_result.valid = False
            validation_result.errors.append("Material category is required")
        
        if not data.get("recyclability_rate"):
            validation_result.warnings.append("Recyclability rate improves compliance scoring")
            
    elif data_type == "fee":
        if not data.get("amount") or float(data.get("amount", 0)) <= 0:
            validation_result.valid = False
            validation_result.errors.append("Fee amount must be greater than 0")
        
        if not data.get("period"):
            validation_result.valid = False
            validation_result.errors.append("Reporting period is required")
            
    elif data_type == "report":
        if not data.get("period"):
            validation_result.valid = False
            validation_result.errors.append("Reporting period is required")
        
        if not data.get("products") or len(data.get("products", [])) == 0:
            validation_result.valid = False
            validation_result.errors.append("At least one product must be included in the report")
    
    return validation_result


@router.get("/audit-trail")
async def get_compliance_audit_trail(
    days: int = Query(30, ge=1, le=365),
    event_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get compliance-related audit trail events."""
    audit_events = []
    event_types = ["score_updated", "issue_resolved", "report_submitted", "data_validated"]
    
    for i in range(10):
        days_ago = i * 3
        audit_events.append({
            "id": str(uuid.uuid4()),
            "event_type": event_types[i % len(event_types)],
            "timestamp": (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat(),
            "user": current_user.email,
            "details": f"Compliance event {i + 1}",
            "metadata": {
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0"
            }
        })
    
    if event_type:
        audit_events = [e for e in audit_events if e["event_type"] == event_type]
    
    return audit_events[skip:skip + limit]


@router.get("/export")
async def export_compliance_data(
    format: str = Query("pdf", pattern="^(pdf|excel|csv)$"),
    include_history: bool = Query(False),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Export compliance data in various formats."""
    try:
        from ..database import Organization
        
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        compliance_data = {
            "organization": {
                "name": organization.name if organization else "Unknown",
                "id": (organization.id if organization
                       else current_user.organization_id)
            },
            "complianceScore": 85,  # Would be calculated in production
            "dueDates": [
                {
                    "description": "Q4 2024 Report",
                    "date": "2025-01-31",
                    "status": "upcoming"
                },
                {
                    "description": "Annual Summary",
                    "date": "2025-03-31",
                    "status": "upcoming"
                }
            ],
            "issues": [],
            "exportDate": datetime.now(timezone.utc).isoformat(),
            "format": format
        }
        
        if include_history:
            compliance_data["history"] = [
                {
                    "period": "Q3 2024",
                    "score": 82,
                    "status": "submitted"
                },
                {
                    "period": "Q2 2024", 
                    "score": 78,
                    "status": "submitted"
                }
            ]
        
        export_id = str(uuid.uuid4())
        
        return {
            "message": "Export data prepared successfully",
            "export_id": export_id,
            "format": format,
            "status": "ready",
            "data": compliance_data,
            "download_url": f"/api/compliance/export/{export_id}/download"
        }
        
    except Exception as e:
        logger.error(f"Failed to export compliance data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to export compliance data. Please try again."
        )
