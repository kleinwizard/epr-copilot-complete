from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, Material
from ..schemas import MaterialCreate, Material as MaterialSchema, MaterialForm
from ..auth import get_current_user
from ..utils.field_converter import camel_to_snake

router = APIRouter(prefix="/api/materials", tags=["materials"])

OREGON_EPR_RATES = {
    "Paper (Label)": 0.12,
    "Paper (Corrugated)": 0.08,
    "Cardboard": 0.10,
    "Plastic (PET)": 0.45,
    "Plastic (HDPE)": 0.38,
    "Plastic (LDPE)": 0.62,
    "Plastic (PP)": 0.42,
    "Plastic (PS)": 0.78,
    "Plastic (Other)": 0.85,
    "Glass": 0.15,
    "Metal (Steel)": 0.22,
    "Metal (Aluminum)": 0.18,
}


@router.get("/", response_model=List[MaterialSchema])
async def get_materials(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all available materials with EPR rates."""
    materials = db.query(Material).filter(
        Material.organization_id == current_user.organization_id
    ).all()

    if not materials:
        for name, rate in OREGON_EPR_RATES.items():
            material = Material(
                name=name,
                epr_rate=rate,
                recyclable=True if "Paper" in name or "Cardboard" in name or "Glass" in name or "Metal" in name else False,
                organization_id=current_user.organization_id
            )
            db.add(material)

        db.commit()
        materials = db.query(Material).filter(
            Material.organization_id == current_user.organization_id
        ).all()

    return materials


@router.get("/{material_id}/epr-rates")
async def get_material_epr_rates(
    material_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get EPR rates for a specific material."""
    material = db.query(Material).filter(
        Material.id == material_id,
        Material.organization_id == current_user.organization_id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    return {
        "material_id": material.id,
        "name": material.name,
        "epr_rate": material.epr_rate,
        "recyclable": material.recyclable
    }


@router.post("/", response_model=MaterialSchema)
async def create_material(
    material: MaterialForm,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new material (admin only)."""
    material_data = material.to_backend_fields()
    db_material = Material(
        **material_data,
        organization_id=current_user.organization_id
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material
