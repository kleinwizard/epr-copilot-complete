from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from ..database import get_db, Organization, User
from ..auth import get_current_user
from ..schemas import User as UserSchema

router = APIRouter(prefix="/api/company", tags=["company"])

class CompanyProfile(BaseModel):
    name: str
    legal_name: Optional[str] = None
    business_id: Optional[str] = None
    deq_number: Optional[str] = None
    naics_code: Optional[str] = None
    entity_type: Optional[str] = None
    description: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class CompanyVerificationStatus(BaseModel):
    oregon_business_registry: str = "Incomplete"
    deq_registration: str = "Incomplete"
    epr_eligibility: str = "Incomplete"
    overall_status: str = "Pending Verification"

@router.get("/profile")
async def get_company_profile(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company profile information"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        return {
            "name": organization.name or "",
            "legal_name": getattr(organization, 'legal_name', '') or "",
            "business_id": getattr(organization, 'business_id', '') or "",
            "deq_number": getattr(organization, 'deq_number', '') or "",
            "naics_code": getattr(organization, 'naics_code', '') or "",
            "entity_type": getattr(organization, 'entity_type', '') or "",
            "description": getattr(organization, 'description', '') or "",
            "street_address": getattr(organization, 'street_address', '') or "",
            "city": getattr(organization, 'city', '') or "",
            "state": getattr(organization, 'state', '') or "",
            "zip_code": getattr(organization, 'zip_code', '') or ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company profile: {str(e)}")

@router.put("/profile")
async def update_company_profile(
    profile: CompanyProfile,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update company profile information"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        for field, value in profile.dict().items():
            if hasattr(organization, field):
                setattr(organization, field, value)
        
        db.commit()
        db.refresh(organization)
        return {"success": True, "message": "Company profile updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update company profile: {str(e)}")

@router.get("/verification-status")
async def get_verification_status(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company verification status"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        return {
            "oregon_business_registry": "Incomplete",
            "deq_registration": "Incomplete", 
            "epr_eligibility": "Incomplete",
            "overall_status": "Pending Verification"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get verification status: {str(e)}")

@router.get("/entities")
async def get_company_entities(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company entities"""
    try:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company entities: {str(e)}")

@router.get("/compliance-profiles")
async def get_compliance_profiles(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance profiles"""
    try:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get compliance profiles: {str(e)}")

@router.get("/documents")
async def get_company_documents(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company documents"""
    try:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company documents: {str(e)}")

@router.get("")
async def get_company_info(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get basic company information"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        return {
            "id": organization.id,
            "name": organization.name,
            "created_at": getattr(organization, 'created_at', None),
            "updated_at": getattr(organization, 'updated_at', None)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company info: {str(e)}")
