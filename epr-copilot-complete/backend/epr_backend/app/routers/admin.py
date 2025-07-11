from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload, joinedload
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, validator
from decimal import Decimal
from datetime import datetime, timezone
from ..database import (
    get_db, Jurisdiction, FeeRate, EcoModificationRule, MaterialCategory,
    Material, User, Report, Organization, Product
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])



class FeeRateUpdate(BaseModel):
    material_category_id: str
    rate_per_unit: Decimal
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    currency: str = "USD"
    
    @validator('rate_per_unit')
    def validate_rate(cls, v):
        if v < 0:
            raise ValueError('Rate per unit cannot be negative')
        return v
    
    @validator('expiry_date')
    def validate_dates(cls, v, values):
        if v and 'effective_date' in values and v <= values['effective_date']:
            raise ValueError('Expiry date must be after effective date')
        return v


class EcoModulationRuleUpdate(BaseModel):
    rule_name: str
    rule_type: str  # 'bonus' or 'penalty'
    logic_definition: Dict[str, Any]
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    description: Optional[str] = None
    
    @validator('rule_type')
    def validate_rule_type(cls, v):
        if v not in ['bonus', 'penalty']:
            raise ValueError('Rule type must be either "bonus" or "penalty"')
        return v
    
    @validator('logic_definition')
    def validate_logic(cls, v):
        required_fields = ['condition', 'adjustment_percentage']
        for field in required_fields:
            if field not in v:
                raise ValueError(f'Logic definition must include {field}')
        return v


class MaterialCategoryCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    recyclable: bool = True
    fee_applicable: bool = True
    parent_category_id: Optional[str] = None


class JurisdictionCreate(BaseModel):
    code: str
    name: str
    country: str = "US"
    description: Optional[str] = None
    active: bool = True


class FeeRateResponse(BaseModel):
    id: str
    material_category_id: str
    material_category_name: str
    rate_per_unit: Decimal
    currency: str
    effective_date: datetime
    expiry_date: Optional[datetime]
    created_at: datetime


class EcoModulationRuleResponse(BaseModel):
    id: str
    rule_name: str
    rule_type: str
    logic_definition: Dict[str, Any]
    description: Optional[str]
    effective_date: datetime
    expiry_date: Optional[datetime]
    created_at: datetime


class AdminStatsResponse(BaseModel):
    total_jurisdictions: int
    total_fee_rates: int
    total_eco_rules: int
    active_calculations_today: int
    last_updated: datetime



def verify_admin_access(current_user):
    """Verify that the current user has admin access."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    if not hasattr(current_user, 'role') or current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. Contact your system administrator."
        )
    
    return current_user



@router.get("/jurisdictions", response_model=List[Dict[str, Any]])
async def list_jurisdictions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List all jurisdictions in the system."""
    verify_admin_access(current_user)
    
    jurisdictions = db.query(Jurisdiction).options(
        selectinload(Jurisdiction.material_categories),
        selectinload(Jurisdiction.fee_rates)
    ).all()
    return [
        {
            "id": j.id,
            "code": j.code,
            "name": j.name,
            "country": j.country,
            "active": j.active,
            "created_at": j.created_at
        }
        for j in jurisdictions
    ]


@router.post("/jurisdictions")
async def create_jurisdiction(
    jurisdiction_data: JurisdictionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new jurisdiction for EPR compliance tracking."""
    verify_admin_access(current_user)
    
    existing = db.query(Jurisdiction).filter(
        Jurisdiction.code == jurisdiction_data.code.upper()
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Jurisdiction with code {jurisdiction_data.code} already exists"
        )
    
    jurisdiction = Jurisdiction(
        code=jurisdiction_data.code.upper(),
        name=jurisdiction_data.name,
        country=jurisdiction_data.country,
        description=jurisdiction_data.description,
        active=jurisdiction_data.active
    )
    
    db.add(jurisdiction)
    db.commit()
    db.refresh(jurisdiction)
    
    return {
        "message": f"Jurisdiction {jurisdiction.name} created successfully",
        "jurisdiction_id": jurisdiction.id
    }



@router.get("/jurisdictions/{jurisdiction_id}/fee-rates", response_model=List[FeeRateResponse])
async def get_fee_rates(
    jurisdiction_id: str,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all fee rates for a specific jurisdiction."""
    verify_admin_access(current_user)
    
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == jurisdiction_id).first()
    if not jurisdiction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jurisdiction not found"
        )
    
    query = db.query(FeeRate).filter(FeeRate.jurisdiction_id == jurisdiction_id)
    
    if active_only:
        current_time = datetime.now(timezone.utc)
        query = query.filter(
            FeeRate.effective_date <= current_time,
            (FeeRate.expiry_date.is_(None)) | (FeeRate.expiry_date > current_time)
        )
    
    fee_rates = query.options(
        joinedload(FeeRate.material_category),
        joinedload(FeeRate.jurisdiction)
    ).all()
    
    response = []
    for rate in fee_rates:
        material_category = db.query(MaterialCategory).filter(
            MaterialCategory.id == rate.material_category_id
        ).first()
        
        response.append(FeeRateResponse(
            id=rate.id,
            material_category_id=rate.material_category_id,
            material_category_name=material_category.name if material_category else "Unknown",
            rate_per_unit=rate.rate_per_unit,
            currency=rate.currency,
            effective_date=rate.effective_date,
            expiry_date=rate.expiry_date,
            created_at=rate.created_at
        ))
    
    return response


@router.put("/jurisdictions/{jurisdiction_id}/fee-rates")
async def update_fee_rates(
    jurisdiction_id: str,
    fee_rates: List[FeeRateUpdate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Update fee rates for a jurisdiction.
    
    This endpoint allows compliance specialists to update EPR fee rates
    without requiring code deployments. All changes are tracked with
    effective dates for audit compliance.
    """
    verify_admin_access(current_user)
    
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == jurisdiction_id).first()
    if not jurisdiction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jurisdiction not found"
        )
    
    created_rates = []
    
    try:
        for rate_update in fee_rates:
            material_category = db.query(MaterialCategory).filter(
                MaterialCategory.id == rate_update.material_category_id
            ).first()
            
            if not material_category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Material category {rate_update.material_category_id} not found"
                )
            
            fee_rate = FeeRate(
                jurisdiction_id=jurisdiction_id,
                material_category_id=rate_update.material_category_id,
                rate_per_unit=rate_update.rate_per_unit,
                currency=rate_update.currency,
                effective_date=rate_update.effective_date,
                expiry_date=rate_update.expiry_date
            )
            
            db.add(fee_rate)
            created_rates.append(fee_rate)
        
        db.commit()
        
        return {
            "message": f"Successfully updated {len(fee_rates)} fee rates for {jurisdiction.name}",
            "jurisdiction": jurisdiction.name,
            "updated_rates": len(fee_rates),
            "effective_dates": [str(rate.effective_date) for rate in created_rates]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update fee rates: {str(e)}"
        )



@router.get("/jurisdictions/{jurisdiction_id}/eco-rules", response_model=List[EcoModulationRuleResponse])
async def get_eco_modulation_rules(
    jurisdiction_id: str,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all eco-modulation rules for a specific jurisdiction."""
    verify_admin_access(current_user)
    
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == jurisdiction_id).first()
    if not jurisdiction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jurisdiction not found"
        )
    
    query = db.query(EcoModificationRule).filter(
        EcoModificationRule.jurisdiction_id == jurisdiction_id
    )
    
    if active_only:
        current_time = datetime.now(timezone.utc)
        query = query.filter(
            EcoModificationRule.effective_date <= current_time,
            (EcoModificationRule.expiry_date.is_(None)) | 
            (EcoModificationRule.expiry_date > current_time)
        )
    
    rules = query.options(
        joinedload(EcoModificationRule.jurisdiction)
    ).all()
    
    return [
        EcoModulationRuleResponse(
            id=rule.id,
            rule_name=rule.rule_name,
            rule_type=rule.rule_type,
            logic_definition=rule.logic_definition,
            description=rule.description,
            effective_date=rule.effective_date,
            expiry_date=rule.expiry_date,
            created_at=rule.created_at
        )
        for rule in rules
    ]


@router.post("/jurisdictions/{jurisdiction_id}/eco-rules")
async def create_eco_modulation_rule(
    jurisdiction_id: str,
    rule_data: EcoModulationRuleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Create a new eco-modulation rule for a jurisdiction.
    
    This endpoint allows compliance specialists to add new sustainability
    bonuses or penalties without code deployments. Rules are defined using
    a flexible JSON logic structure.
    """
    verify_admin_access(current_user)
    
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == jurisdiction_id).first()
    if not jurisdiction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jurisdiction not found"
        )
    
    existing_rule = db.query(EcoModificationRule).filter(
        EcoModificationRule.jurisdiction_id == jurisdiction_id,
        EcoModificationRule.rule_name == rule_data.rule_name
    ).first()
    
    if existing_rule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Eco-modulation rule '{rule_data.rule_name}' already exists for this jurisdiction"
        )
    
    try:
        eco_rule = EcoModificationRule(
            jurisdiction_id=jurisdiction_id,
            rule_name=rule_data.rule_name,
            rule_type=rule_data.rule_type,
            logic_definition=rule_data.logic_definition,
            description=rule_data.description,
            effective_date=rule_data.effective_date,
            expiry_date=rule_data.expiry_date
        )
        
        db.add(eco_rule)
        db.commit()
        db.refresh(eco_rule)
        
        return {
            "message": f"Eco-modulation rule '{rule_data.rule_name}' created successfully",
            "rule_id": eco_rule.id,
            "jurisdiction": jurisdiction.name,
            "rule_type": rule_data.rule_type,
            "effective_date": rule_data.effective_date
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create eco-modulation rule: {str(e)}"
        )


@router.put("/jurisdictions/{jurisdiction_id}/eco-rules/{rule_id}")
async def update_eco_modulation_rule(
    jurisdiction_id: str,
    rule_id: str,
    rule_data: EcoModulationRuleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update an existing eco-modulation rule."""
    verify_admin_access(current_user)
    
    rule = db.query(EcoModificationRule).filter(
        EcoModificationRule.id == rule_id,
        EcoModificationRule.jurisdiction_id == jurisdiction_id
    ).first()
    
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eco-modulation rule not found"
        )
    
    try:
        rule.rule_name = rule_data.rule_name
        rule.rule_type = rule_data.rule_type
        rule.logic_definition = rule_data.logic_definition
        rule.description = rule_data.description
        rule.effective_date = rule_data.effective_date
        rule.expiry_date = rule_data.expiry_date
        
        db.commit()
        
        return {
            "message": f"Eco-modulation rule '{rule_data.rule_name}' updated successfully",
            "rule_id": rule_id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update eco-modulation rule: {str(e)}"
        )



@router.get("/material-categories")
async def list_material_categories(
    jurisdiction_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List all material categories, optionally filtered by jurisdiction."""
    verify_admin_access(current_user)
    
    query = db.query(MaterialCategory)
    
    if jurisdiction_id:
        query = query.filter(MaterialCategory.jurisdiction_id == jurisdiction_id)
    
    categories = query.options(
        joinedload(MaterialCategory.jurisdiction),
        joinedload(MaterialCategory.parent)
    ).all()
    
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "code": cat.code,
            "description": cat.description,
            "recyclable": cat.recyclable,
            "fee_applicable": cat.fee_applicable,
            "jurisdiction_id": cat.jurisdiction_id,
            "parent_category_id": cat.parent_category_id,
            "created_at": cat.created_at
        }
        for cat in categories
    ]


@router.post("/jurisdictions/{jurisdiction_id}/material-categories")
async def create_material_category(
    jurisdiction_id: str,
    category_data: MaterialCategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new material category for a jurisdiction."""
    verify_admin_access(current_user)
    
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == jurisdiction_id).first()
    if not jurisdiction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jurisdiction not found"
        )
    
    existing_category = db.query(MaterialCategory).filter(
        MaterialCategory.jurisdiction_id == jurisdiction_id,
        MaterialCategory.code == category_data.code
    ).first()
    
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Material category with code '{category_data.code}' already exists for this jurisdiction"
        )
    
    try:
        material_category = MaterialCategory(
            jurisdiction_id=jurisdiction_id,
            name=category_data.name,
            code=category_data.code,
            description=category_data.description,
            recyclable=category_data.recyclable,
            fee_applicable=category_data.fee_applicable,
            parent_category_id=category_data.parent_category_id
        )
        
        db.add(material_category)
        db.commit()
        db.refresh(material_category)
        
        return {
            "message": f"Material category '{category_data.name}' created successfully",
            "category_id": material_category.id,
            "jurisdiction": jurisdiction.name
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create material category: {str(e)}"
        )



@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get system statistics for admin dashboard."""
    verify_admin_access(current_user)
    
    total_jurisdictions = db.query(Jurisdiction).count()
    total_fee_rates = db.query(FeeRate).count()
    total_eco_rules = db.query(EcoModificationRule).count()
    
    today = datetime.now(timezone.utc).date()
    from ..database import CalculatedFee
    active_calculations_today = db.query(CalculatedFee).filter(
        CalculatedFee.created_at >= today
    ).count()
    
    return AdminStatsResponse(
        total_jurisdictions=total_jurisdictions,
        total_fee_rates=total_fee_rates,
        total_eco_rules=total_eco_rules,
        active_calculations_today=active_calculations_today,
        last_updated=datetime.now(timezone.utc)
    )


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get dashboard statistics for admin tools."""
    verify_admin_access(current_user)
    
    total_users = db.query(User).count()
    total_reports = db.query(Report).count()
    total_organizations = db.query(Organization).count()
    active_products = db.query(Product).count()
    
    return {
        "totalUsers": total_users,
        "customForms": 0,  # Placeholder - forms system not yet implemented
        "customReports": total_reports,
        "activeWorkflows": 0,  # Placeholder - workflow system not yet implemented
        "totalOrganizations": total_organizations,
        "activeProducts": active_products
    }


@router.post("/jurisdictions/{jurisdiction_id}/bulk-import")
async def bulk_import_data(
    jurisdiction_id: str,
    import_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Bulk import fee rates, eco-modulation rules, and material categories.
    
    This endpoint allows admins to efficiently onboard new jurisdictions
    by importing all necessary data in a single operation.
    """
    verify_admin_access(current_user)
    
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == jurisdiction_id).first()
    if not jurisdiction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jurisdiction not found"
        )
    
    results = {
        "material_categories": 0,
        "fee_rates": 0,
        "eco_rules": 0,
        "errors": []
    }
    
    try:
        if "material_categories" in import_data:
            for cat_data in import_data["material_categories"]:
                try:
                    category = MaterialCategory(
                        jurisdiction_id=jurisdiction_id,
                        name=cat_data["name"],
                        code=cat_data["code"],
                        description=cat_data.get("description"),
                        recyclable=cat_data.get("recyclable", True),
                        fee_applicable=cat_data.get("fee_applicable", True)
                    )
                    db.add(category)
                    results["material_categories"] += 1
                except Exception as e:
                    results["errors"].append(f"Material category '{cat_data.get('name', 'unknown')}': {str(e)}")
        
        if "fee_rates" in import_data:
            for rate_data in import_data["fee_rates"]:
                try:
                    fee_rate = FeeRate(
                        jurisdiction_id=jurisdiction_id,
                        material_category_id=rate_data["material_category_id"],
                        rate_per_unit=Decimal(str(rate_data["rate_per_unit"])),
                        currency=rate_data.get("currency", "USD"),
                        effective_date=datetime.fromisoformat(rate_data["effective_date"]),
                        expiry_date=datetime.fromisoformat(rate_data["expiry_date"]) if rate_data.get("expiry_date") else None
                    )
                    db.add(fee_rate)
                    results["fee_rates"] += 1
                except Exception as e:
                    results["errors"].append(f"Fee rate for category '{rate_data.get('material_category_id', 'unknown')}': {str(e)}")
        
        if "eco_rules" in import_data:
            for rule_data in import_data["eco_rules"]:
                try:
                    eco_rule = EcoModificationRule(
                        jurisdiction_id=jurisdiction_id,
                        rule_name=rule_data["rule_name"],
                        rule_type=rule_data["rule_type"],
                        logic_definition=rule_data["logic_definition"],
                        description=rule_data.get("description"),
                        effective_date=datetime.fromisoformat(rule_data["effective_date"]),
                        expiry_date=datetime.fromisoformat(rule_data["expiry_date"]) if rule_data.get("expiry_date") else None
                    )
                    db.add(eco_rule)
                    results["eco_rules"] += 1
                except Exception as e:
                    results["errors"].append(f"Eco rule '{rule_data.get('rule_name', 'unknown')}': {str(e)}")
        
        db.commit()
        
        return {
            "message": f"Bulk import completed for {jurisdiction.name}",
            "results": results
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk import failed: {str(e)}"
        )
