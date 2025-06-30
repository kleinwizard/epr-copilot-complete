from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List
from decimal import Decimal
from datetime import datetime, timezone
from ..database import get_db, Material
from ..auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/epr-rates", tags=["epr-rates"])


class EPRRateResponse(BaseModel):
    material_type: str
    rate_per_pound: Decimal
    effective_date: str
    state: str = "Oregon"


class FeeCalculationRequest(BaseModel):
    products: List[Dict]
    state: str = "Oregon"
    quarter: str
    year: int


class FeeCalculationResponse(BaseModel):
    total_fee: Decimal
    breakdown: List[Dict]
    base_fee: Decimal
    discounts: Decimal
    calculation_date: str


OREGON_EPR_RATES = {
    "plastic": Decimal("0.12"),  # $0.12 per pound
    "glass": Decimal("0.08"),    # $0.08 per pound
    "metal": Decimal("0.15"),    # $0.15 per pound
    "paper": Decimal("0.05"),    # $0.05 per pound
    "cardboard": Decimal("0.04"),  # $0.04 per pound
    "foam": Decimal("0.20"),     # $0.20 per pound
    "composite": Decimal("0.18"),  # $0.18 per pound
}


@router.get("/current", response_model=List[EPRRateResponse])
async def get_current_epr_rates(
    state: str = "Oregon",
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current EPR rates for packaging materials."""

    rates = []
    for material_type, rate in OREGON_EPR_RATES.items():
        rates.append(EPRRateResponse(
            material_type=material_type,
            rate_per_pound=rate,
            effective_date="2024-01-01",
            state=state
        ))

    return rates


@router.post("/calculate", response_model=FeeCalculationResponse)
async def calculate_epr_fees(
    request: FeeCalculationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate EPR fees based on product packaging data."""

    total_fee = Decimal("0")
    breakdown = []
    base_fee = Decimal("0")
    discounts = Decimal("0")

    for product in request.products:
        product_name = product.get("name", "Unknown Product")
        materials = product.get("materials", [])
        quantity_sold = Decimal(str(product.get("quantity_sold", 0)))

        product_fee = Decimal("0")
        product_breakdown = {
            "product_name": product_name,
            "quantity_sold": float(quantity_sold),
            "materials": []
        }

        for material in materials:
            material_type = material.get("type", "").lower()
            weight_per_unit = Decimal(
                str(material.get("weight_per_unit", 0)))  # in pounds

            if material_type in OREGON_EPR_RATES:
                rate = OREGON_EPR_RATES[material_type]
                material_fee = quantity_sold * weight_per_unit * rate
                product_fee += material_fee

                product_breakdown["materials"].append({
                    "type": material_type,
                    "weight_per_unit": float(weight_per_unit),
                    "total_weight": float(quantity_sold * weight_per_unit),
                    "rate_per_pound": float(rate),
                    "fee": float(material_fee)
                })

        product_breakdown["total_fee"] = float(product_fee)
        breakdown.append(product_breakdown)
        total_fee += product_fee

    base_fee = total_fee

    if total_fee > Decimal("10000"):  # $10,000+ gets 5% discount
        discounts = total_fee * Decimal("0.05")
        total_fee -= discounts
    elif total_fee > Decimal("5000"):  # $5,000+ gets 2% discount
        discounts = total_fee * Decimal("0.02")
        total_fee -= discounts

    return FeeCalculationResponse(
        total_fee=total_fee,
        breakdown=breakdown,
        base_fee=base_fee,
        discounts=discounts,
        calculation_date=datetime.now(timezone.utc).isoformat()
    )


@router.get("/materials/{material_type}/rate")
async def get_material_rate(
    material_type: str,
    state: str = "Oregon",
    current_user=Depends(get_current_user)
):
    """Get EPR rate for a specific material type."""

    material_type = material_type.lower()
    if material_type not in OREGON_EPR_RATES:
        raise HTTPException(
            status_code=404,
            detail=f"EPR rate not found for material type: {material_type}"
        )

    return {
        "material_type": material_type,
        "rate_per_pound": OREGON_EPR_RATES[material_type],
        "state": state,
        "effective_date": "2024-01-01"
    }
