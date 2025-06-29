from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from decimal import Decimal
from ..database import get_db, Material
from ..auth import get_current_user

router = APIRouter(prefix="/api/fees", tags=["fees"])


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
async def calculate_fees(
    request: FeeCalculationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Calculate EPR fees for given materials."""

    db_materials = db.query(Material).all()
    material_rates = {m.name: float(m.epr_rate)
                      for m in db_materials if m.epr_rate}

    material_fees = []
    for material in request.materials:
        base_rate = material_rates.get(material.type, 0.50)

        recyclability_multiplier = 0.75 if material.recyclable else 1.0
        adjusted_rate = base_rate * recyclability_multiplier

        weight_in_kg = material.weight / 1000
        fee = weight_in_kg * adjusted_rate

        material_fees.append(MaterialFeeResult(
            type=material.type,
            weight=material.weight,
            recyclable=material.recyclable,
            base_rate=base_rate,
            adjusted_rate=adjusted_rate,
            fee=fee
        ))

    total_weight = sum(m.weight for m in request.materials)
    base_fee = sum((m.weight / 1000) * material_rates.get(m.type, 0.50)
                   for m in request.materials)
    total_fee = sum(mf.fee for mf in material_fees)
    recyclability_discount = base_fee - total_fee

    return FeeCalculationResult(
        materials=material_fees,
        total_weight=total_weight,
        total_fee=total_fee,
        recyclability_discount=recyclability_discount,
        breakdown={
            "base_fee": base_fee,
            "recyclability_adjustment": -recyclability_discount,
            "final_fee": total_fee
        }
    )


@router.get("/history")
async def get_fee_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get fee calculation history for the current user's organization."""
    return []
