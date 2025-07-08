from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from ..database import get_db, Organization, User
from ..auth import get_current_user
from ..schemas import User as UserSchema
from ..cache import cache_result
from ..utils.field_converter import convert_frontend_fields
from datetime import timedelta
import json
import uuid
from datetime import datetime

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

class ComplianceProfileCreate(BaseModel):
    jurisdiction: str
    annualRevenue: float
    annualTonnage: float

class BusinessEntityCreate(BaseModel):
    name: str
    roles: List[str]
    type: str = "subsidiary"

class DocumentUpload(BaseModel):
    name: str
    type: str
    size: int
    upload_date: str

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
        
        field_mapping = {
            'legalName': 'legal_name',
            'businessId': 'business_id',
            'deqNumber': 'deq_number',
            'naicsCode': 'naics_code',
            'entityType': 'entity_type',
            'streetAddress': 'street_address',
            'zipCode': 'zip_code'
        }
        converted_data = convert_frontend_fields(profile.dict(), field_mapping)
        
        for field, value in converted_data.items():
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
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            return []
            
        business_entities = getattr(organization, 'business_entities', '[]')
        if isinstance(business_entities, str):
            try:
                return json.loads(business_entities)
            except:
                return []
        return business_entities or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company entities: {str(e)}")

@router.post("/entities")
async def create_business_entity(
    entity: BusinessEntityCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new business entity"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        existing_entities = getattr(organization, 'business_entities', '[]')
        if isinstance(existing_entities, str):
            try:
                entities_list = json.loads(existing_entities)
            except:
                entities_list = []
        else:
            entities_list = existing_entities or []
        
        new_entity = {
            "id": str(uuid.uuid4()),
            "name": entity.name,
            "roles": entity.roles,
            "type": entity.type,
            "created_at": datetime.now().isoformat()
        }
        
        entities_list.append(new_entity)
        
        if not hasattr(organization, 'business_entities'):
            setattr(organization, 'business_entities', json.dumps(entities_list))
        else:
            organization.business_entities = json.dumps(entities_list)
        
        db.commit()
        db.refresh(organization)
        
        return new_entity
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create business entity: {str(e)}")

@router.get("/compliance-profiles")
async def get_compliance_profiles(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance profiles"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            return []
            
        compliance_profiles = getattr(organization, 'compliance_profiles', '[]')
        if isinstance(compliance_profiles, str):
            try:
                return json.loads(compliance_profiles)
            except:
                return []
        return compliance_profiles or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get compliance profiles: {str(e)}")

@router.post("/compliance-profiles")
async def create_compliance_profile(
    profile: ComplianceProfileCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new compliance profile"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        existing_profiles = getattr(organization, 'compliance_profiles', '[]')
        if isinstance(existing_profiles, str):
            try:
                profiles_list = json.loads(existing_profiles)
            except:
                profiles_list = []
        else:
            profiles_list = existing_profiles or []
        
        new_profile = {
            "id": str(uuid.uuid4()),
            "jurisdiction": profile.jurisdiction,
            "annualRevenue": profile.annualRevenue,
            "annualTonnage": profile.annualTonnage,
            "created_at": datetime.now().isoformat()
        }
        
        profiles_list.append(new_profile)
        
        if not hasattr(organization, 'compliance_profiles'):
            setattr(organization, 'compliance_profiles', json.dumps(profiles_list))
        else:
            organization.compliance_profiles = json.dumps(profiles_list)
        
        db.commit()
        db.refresh(organization)
        
        return new_profile
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create compliance profile: {str(e)}")

@router.get("/documents")
async def get_company_documents(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company documents"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            return []
            
        documents = getattr(organization, 'documents', '[]')
        if isinstance(documents, str):
            try:
                return json.loads(documents)
            except:
                return []
        return documents or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company documents: {str(e)}")

@router.post("/documents")
async def upload_company_document(
    file: UploadFile = File(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a company document"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        existing_documents = getattr(organization, 'documents', '[]')
        if isinstance(existing_documents, str):
            try:
                documents_list = json.loads(existing_documents)
            except:
                documents_list = []
        else:
            documents_list = existing_documents or []
        
        file_content = await file.read()
        
        new_document = {
            "id": str(uuid.uuid4()),
            "name": file.filename,
            "type": file.content_type or "application/octet-stream",
            "size": len(file_content),
            "upload_date": datetime.now().isoformat(),
            "filename": file.filename
        }
        
        documents_list.append(new_document)
        
        if not hasattr(organization, 'documents'):
            setattr(organization, 'documents', json.dumps(documents_list))
        else:
            organization.documents = json.dumps(documents_list)
        
        db.commit()
        db.refresh(organization)
        
        return {
            "success": True,
            "document": new_document,
            "filename": file.filename
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")

@router.get("/setup-data")
@cache_result(expiration=timedelta(minutes=5))
async def get_company_setup_data(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all company setup data in a single optimized call"""
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        company_data = {
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
        
        compliance_profiles = getattr(organization, 'compliance_profiles', '[]')
        if isinstance(compliance_profiles, str):
            try:
                profiles = json.loads(compliance_profiles)
            except:
                profiles = []
        else:
            profiles = compliance_profiles or []
        
        business_entities = getattr(organization, 'business_entities', '[]')
        if isinstance(business_entities, str):
            try:
                entities = json.loads(business_entities)
            except:
                entities = []
        else:
            entities = business_entities or []
        
        documents = getattr(organization, 'documents', '[]')
        if isinstance(documents, str):
            try:
                docs = json.loads(documents)
            except:
                docs = []
        else:
            docs = documents or []
        
        return {
            "companyData": company_data,
            "profiles": profiles,
            "entities": entities,
            "documents": docs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company setup data: {str(e)}")

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
