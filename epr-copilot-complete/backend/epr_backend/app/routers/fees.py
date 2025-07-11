from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload, joinedload
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel
from decimal import Decimal, ROUND_HALF_EVEN
from datetime import datetime, timezone
from ..database import get_db, Material, CalculatedFee, CalculationStep
from ..auth import get_current_user
from ..cache import cache_result
from ..validation_schemas import FeeCalculationValidationSchema
from ..calculation_engine import EPRCalculationEngine

router = APIRouter(prefix="/api/fees", tags=["fees"])


def calculate_epr_fee(
    weight: Decimal, 
    rate: Decimal, 
    material_type: Optional[str] = None,
    apply_volume_discount: bool = False,
    generate_audit: bool = False
):
    """
    Calculate EPR fee with proper Decimal precision for legal compliance.
    
    Args:
        weight: Weight in kg (must be Decimal for financial accuracy)
        rate: Rate per kg (must be Decimal for financial accuracy)
        material_type: Optional material type for specific calculations
        apply_volume_discount: Whether to apply volume discounts for large quantities
        generate_audit: Whether to generate audit trail for compliance
    
    Returns:
        Decimal fee amount, or tuple of (fee, audit_log) if generate_audit=True
    
    Raises:
        ValueError: If weight is negative or invalid
        TypeError: If inputs are not Decimal type
    """
    if not isinstance(weight, Decimal):
        raise TypeError("Weight must be Decimal type for financial accuracy")
    if not isinstance(rate, Decimal):
        raise TypeError("Rate must be Decimal type for financial accuracy")
    if weight < Decimal('0'):
        raise ValueError("Weight cannot be negative")
    
    base_fee = weight * rate
    
    final_fee = base_fee
    discount_applied = Decimal('0')
    
    if apply_volume_discount and weight >= Decimal('1000.0000'):  # 1 ton threshold
        discount_rate = Decimal('0.05')
        discount_applied = base_fee * discount_rate
        final_fee = base_fee - discount_applied
    
    final_fee = final_fee.quantize(Decimal('0.0001'), rounding=ROUND_HALF_EVEN)
    
    if generate_audit:
        audit_log = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'weight': str(weight),
            'rate': str(rate),
            'material_type': material_type,
            'base_fee': str(base_fee),
            'volume_discount_applied': apply_volume_discount,
            'discount_amount': str(discount_applied),
            'calculated_fee': str(final_fee),
            'rounding_method': 'ROUND_HALF_EVEN',
            'precision': '4_decimal_places'
        }
        return final_fee, audit_log
    
    return final_fee


class MaterialInput(BaseModel):
    type: str
    weight: float  # in grams
    recyclable: bool


class FeeCalculationRequest(BaseModel):
    materials: List[MaterialInput]


class MaterialFeeResult(BaseModel):
    type: str
    weight: float
    recyclable: bool
    base_rate: float
    adjusted_rate: float
    fee: float


class FeeCalculationResult(BaseModel):
    materials: List[MaterialFeeResult]
    total_weight: float
    total_fee: float
    recyclability_discount: float
    breakdown: dict



class ProducerData(BaseModel):
    organization_id: str
    annual_revenue: Decimal
    annual_tonnage: Decimal
    produces_perishable_food: bool = False
    has_lca_disclosure: bool = False
    has_environmental_impact_reduction: bool = False
    uses_reusable_packaging: bool = False
    annual_recycling_rates: List[float] = []


class PackagingComponent(BaseModel):
    material_type: str
    component_name: str
    weight_per_unit: Decimal
    weight_unit: str
    units_sold: int
    recycled_content_percentage: Decimal = Decimal('0')
    recyclable: bool = True
    reusable: bool = False
    disrupts_recycling: bool = False
    recyclability_score: Decimal = Decimal('50')
    contains_pfas: bool = False
    contains_phthalates: bool = False
    marine_degradable: bool = False
    harmful_to_marine_life: bool = False
    bay_friendly: bool = False
    cold_weather_stable: bool = False


class SystemData(BaseModel):
    municipal_support_costs: Optional[Decimal] = None
    infrastructure_costs: Optional[Decimal] = None
    administrative_costs: Optional[Decimal] = None
    education_outreach_costs: Optional[Decimal] = None
    system_total_tonnage: Optional[Decimal] = None


class FeeCalculationRequestV1(BaseModel):
    jurisdiction_code: str
    producer_data: ProducerData
    packaging_data: List[PackagingComponent]
    system_data: Optional[SystemData] = None
    calculation_date: Optional[str] = None
    data_source: str = "api"


class CalculationStepResponse(BaseModel):
    step_number: int
    step_name: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    rule_applied: str
    legal_citation: str
    calculation_method: str
    timestamp: str
    jurisdiction: str


class FeeCalculationResponseV1(BaseModel):
    calculation_id: str
    jurisdiction: str
    total_fee: Decimal
    currency: str
    calculation_timestamp: str
    calculation_breakdown: Dict[str, Any]
    legal_citations: List[str]
    compliance_status: str


class AuditTraceResponse(BaseModel):
    calculation_id: str
    jurisdiction: str
    total_steps: int
    audit_trail: List[CalculationStepResponse]
    legal_citations: List[str]
    calculation_timestamp: str


@router.post("/calculate", response_model=FeeCalculationResult)
@cache_result()
async def calculate_fees(
    request: FeeCalculationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Calculate EPR fees for given materials using Decimal precision for legal compliance."""

    db_materials = db.query(Material).filter(
        Material.organization_id == current_user.organization_id
    ).options(joinedload(Material.organization)).all()
    material_rates = {m.name: Decimal(str(m.epr_rate))
                      for m in db_materials if m.epr_rate}

    material_fees = []
    total_fee_decimal = Decimal('0')
    total_weight_decimal = Decimal('0')
    
    for material in request.materials:
        base_rate = material_rates.get(material.type, Decimal('0.50'))
        weight_decimal = Decimal(str(material.weight))
        weight_in_kg = weight_decimal / Decimal('1000')
        
        recyclability_multiplier = Decimal('0.75') if material.recyclable else Decimal('1.0')
        adjusted_rate = base_rate * recyclability_multiplier
        
        result = calculate_epr_fee(
            weight=weight_in_kg,
            rate=adjusted_rate,
            material_type=material.type,
            apply_volume_discount=True,
            generate_audit=True
        )
        if isinstance(result, tuple):
            fee_decimal, audit_log = result
        else:
            fee_decimal = result
            audit_log = {}

        material_fees.append(MaterialFeeResult(
            type=material.type,
            weight=float(material.weight),
            recyclable=material.recyclable,
            base_rate=float(base_rate),
            adjusted_rate=float(adjusted_rate),
            fee=float(fee_decimal)
        ))
        
        total_fee_decimal += fee_decimal
        total_weight_decimal += weight_decimal

    base_fee_decimal = sum(
        (Decimal(str(m.weight)) / Decimal('1000')) * material_rates.get(m.type, Decimal('0.50'))
        for m in request.materials
    )
    recyclability_discount_decimal = base_fee_decimal - total_fee_decimal

    return FeeCalculationResult(
        materials=material_fees,
        total_weight=float(total_weight_decimal),
        total_fee=float(total_fee_decimal),
        recyclability_discount=float(recyclability_discount_decimal),
        breakdown={
            "base_fee": float(base_fee_decimal),
            "recyclability_adjustment": float(-recyclability_discount_decimal),
            "final_fee": float(total_fee_decimal)
        }
    )


@router.get("/history")
async def get_fee_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get fee calculation history for the current user's organization."""
    return []


@router.get("/jurisdictions")
async def get_supported_jurisdictions(
    db: Session = Depends(get_db)
):
    """Get list of supported jurisdictions for fee calculation (public endpoint)."""
    # Return hardcoded list of supported jurisdictions for fee calculation
    return [
        { "code": "OR", "name": "Oregon", "model_type": "PRO-led Fee System" },
        { "code": "CA", "name": "California", "model_type": "PRO-led Fee System" },
        { "code": "CO", "name": "Colorado", "model_type": "Municipal Reimbursement" },
        { "code": "ME", "name": "Maine", "model_type": "Full Municipal Reimbursement" },
        { "code": "MD", "name": "Maryland", "model_type": "Shared Responsibility" },
        { "code": "MN", "name": "Minnesota", "model_type": "Shared Responsibility" },
        { "code": "WA", "name": "Washington", "model_type": "Shared Responsibility" }
    ]



@router.post("/v1/calculate-fee", response_model=FeeCalculationResponseV1)
async def calculate_fee_v1(
    request: FeeCalculationRequestV1,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Execute the full 8-stage EPR calculation pipeline for a given producer report.
    
    This endpoint implements the comprehensive EPR fee calculation system as specified
    in the EPR Compliance Application Specification. It processes producer data through
    a standardized logical pipeline that is applied consistently across all jurisdictions.
    
    The calculation includes:
    1. Data Ingestion & Standardization
    2. Unit Standardization (convert to kg)
    3. Material Classification
    4. Base Fee Calculation
    5. Eco-Modulation (sustainability bonuses/penalties)
    6. Discounts & Exemptions
    7. Aggregation & Rounding
    8. Audit Trail Generation
    
    Returns a unique calculation_id that can be used to retrieve the detailed
    audit trail via the /v1/fees/{calculation_id}/trace endpoint.
    """
    try:
        supported_jurisdictions = ['OR', 'CA', 'CO', 'ME', 'MD', 'MN', 'WA']
        if request.jurisdiction_code.upper() not in supported_jurisdictions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported jurisdiction: {request.jurisdiction_code}. "
                       f"Supported jurisdictions: {', '.join(supported_jurisdictions)}"
            )
        
        engine = EPRCalculationEngine(request.jurisdiction_code.upper(), db)
        
        report_data = {
            "producer_data": request.producer_data.dict(),
            "packaging_data": [component.dict() for component in request.packaging_data],
            "system_data": request.system_data.dict() if request.system_data else {},
            "calculation_date": request.calculation_date,
            "data_source": request.data_source
        }
        
        result = engine.calculate_epr_fee_comprehensive(report_data)
        
        return FeeCalculationResponseV1(
            calculation_id=result["calculation_id"],
            jurisdiction=result["jurisdiction"],
            total_fee=result["total_fee"],
            currency=result["currency"],
            calculation_timestamp=result["calculation_timestamp"],
            calculation_breakdown=result["calculation_breakdown"],
            legal_citations=result["legal_citations"],
            compliance_status=result["compliance_status"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")


@router.get("/v1/fees/{calculation_id}/trace", response_model=AuditTraceResponse)
async def get_calculation_trace(
    calculation_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Retrieve the detailed, immutable audit trail for a specific EPR fee calculation.
    
    This endpoint provides complete transparency into how a fee was calculated,
    including every step of the calculation pipeline with legal citations.
    This audit trail is essential for regulatory compliance and legal defensibility.
    
    The audit trail includes:
    - Step-by-step calculation breakdown
    - Input and output data for each step
    - Rules and formulas applied at each step
    - Legal citations and regulatory references
    - Timestamps for each calculation step
    
    This feature is non-negotiable and essential for building user trust
    and providing a defensible compliance record.
    """
    try:
        calculated_fee = db.query(CalculatedFee).filter(
            CalculatedFee.id == calculation_id
        ).first()
        
        if not calculated_fee:
            raise HTTPException(
                status_code=404, 
                detail=f"Calculation with ID {calculation_id} not found"
            )
        
        calculation_steps = db.query(CalculationStep).filter(
            CalculationStep.calculated_fee_id == calculation_id
        ).order_by(CalculationStep.step_number).all()
        
        if not calculation_steps:
            raise HTTPException(
                status_code=404,
                detail=f"Audit trail not found for calculation {calculation_id}"
            )
        
        audit_trail = []
        legal_citations = set()
        
        for step in calculation_steps:
            step_response = CalculationStepResponse(
                step_number=step.step_number,
                step_name=step.step_name,
                input_data=step.input_data or {},
                output_data=step.output_data or {},
                rule_applied=step.rule_applied or "",
                legal_citation=step.legal_citation or "",
                calculation_method=step.calculation_method or "",
                timestamp=step.created_at.isoformat() if step.created_at else "",
                jurisdiction=calculated_fee.jurisdiction_id or ""
            )
            audit_trail.append(step_response)
            
            if step.legal_citation:
                legal_citations.add(step.legal_citation)
        
        return AuditTraceResponse(
            calculation_id=calculation_id,
            jurisdiction=calculated_fee.jurisdiction_id or "",
            total_steps=len(audit_trail),
            audit_trail=audit_trail,
            legal_citations=list(legal_citations),
            calculation_timestamp=calculated_fee.created_at.isoformat() if calculated_fee.created_at else ""
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve audit trail: {str(e)}"
        )
