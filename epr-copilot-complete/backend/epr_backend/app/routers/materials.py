from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
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


@router.post("/calculate-properties")
async def calculate_material_properties(
    material_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Calculate material properties including EPR rates, recyclability, and sustainability metrics."""
    try:
        material_type = material_data.get("materialType", "")
        category = material_data.get("category", "")
        pcr_content = material_data.get("pcrContent", 0)
        
        base_epr_rate = OREGON_EPR_RATES.get(material_type, 0.50)  # Default rate if not found
        
        pcr_discount = min(pcr_content * 0.002, 0.20)  # Max 20% discount
        adjusted_epr_rate = max(base_epr_rate - pcr_discount, base_epr_rate * 0.5)
        
        recyclable_materials = ["Paper", "Cardboard", "Glass", "Metal", "Plastic (PET)", "Plastic (HDPE)"]
        is_recyclable = any(recyclable in material_type for recyclable in recyclable_materials)
        
        carbon_footprint_base = {
            "Paper": 1.2,
            "Cardboard": 1.0,
            "Plastic": 3.5,
            "Glass": 0.8,
            "Metal": 2.2
        }
        
        carbon_footprint = 2.0  # Default
        for material, footprint in carbon_footprint_base.items():
            if material.lower() in material_type.lower():
                carbon_footprint = footprint
                break
        
        carbon_footprint = carbon_footprint * (1 - pcr_content * 0.003)
        
        sustainability_score = 50  # Base score
        if is_recyclable:
            sustainability_score += 20
        sustainability_score += min(pcr_content * 0.3, 25)  # Up to 25 points for PCR content
        sustainability_score = max(10, min(100, sustainability_score))
        
        recycling_process = "Not recyclable"
        if is_recyclable:
            if "Paper" in material_type or "Cardboard" in material_type:
                recycling_process = "Pulping and de-inking"
            elif "Plastic" in material_type:
                recycling_process = "Mechanical recycling"
            elif "Glass" in material_type:
                recycling_process = "Melting and reforming"
            elif "Metal" in material_type:
                recycling_process = "Melting and purification"
        
        sustainable_alternatives = []
        if "Plastic" in material_type:
            sustainable_alternatives = ["Bioplastic alternatives", "Paper-based packaging", "Reusable containers"]
        elif "Paper" in material_type and pcr_content < 50:
            sustainable_alternatives = ["Higher PCR content paper", "FSC certified paper"]
        elif not is_recyclable:
            sustainable_alternatives = ["Recyclable alternatives", "Compostable materials", "Reusable options"]
        
        return {
            "success": True,
            "data": {
                "epr_rate": round(adjusted_epr_rate, 3),
                "material_type": material_type,
                "category": category,
                "pcr_content": pcr_content,
                "recyclable": is_recyclable,
                "carbon_footprint": round(carbon_footprint, 2),
                "sustainability_score": round(sustainability_score, 1),
                "recycling_process": recycling_process,
                "sustainable_alternatives": sustainable_alternatives,
                "calculation_notes": f"EPR rate calculated with {pcr_content}% PCR content discount"
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to calculate material properties: {str(e)}"
        )
