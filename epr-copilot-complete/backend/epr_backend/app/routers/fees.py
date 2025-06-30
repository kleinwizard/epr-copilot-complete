from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel
from decimal import Decimal, ROUND_HALF_EVEN
from datetime import datetime, timezone
from ..database import get_db, Material
from ..auth import get_current_user
from ..cache import cache_result
from ..validation_schemas import FeeCalculationValidationSchema

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


@router.post("/calculate", response_model=FeeCalculationResult)
@cache_result()
async def calculate_fees(
    request: FeeCalculationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Calculate EPR fees for given materials using Decimal precision for legal compliance."""

    db_materials = db.query(Material).all()
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
