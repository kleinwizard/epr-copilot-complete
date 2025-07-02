"""
Database population script for EPR jurisdictions.

This script populates the database with jurisdiction-specific data including:
- Jurisdictions (OR, CA, CO, ME, MD, MN, WA, EU)
- Material categories for each jurisdiction
- Fee rates for each material category
- Eco-modulation rules for sustainability bonuses/penalties

Based on the EPR Compliance Application Specification.
"""

from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Dict, Any
import json
import logging

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import (
    SessionLocal, Jurisdiction, MaterialCategory, FeeRate, 
    EcoModificationRule, engine, Base
)


def create_jurisdictions(db: Session) -> Dict[str, str]:
    """Create all EPR jurisdictions and return mapping of codes to IDs."""
    
    jurisdictions_data = [
        {
            "code": "OR",
            "name": "Oregon",
            "country": "US",
            "model_type": "PRO-led",
            "small_producer_revenue_threshold": Decimal("5000000"),
            "small_producer_tonnage_threshold": Decimal("1.0"),
            "effective_date": datetime(2024, 1, 1, tzinfo=timezone.utc)
        },
        {
            "code": "CA", 
            "name": "California",
            "country": "US",
            "model_type": "PRO-led",
            "small_producer_revenue_threshold": Decimal("1000000"),
            "small_producer_tonnage_threshold": None,
            "effective_date": datetime(2024, 1, 1, tzinfo=timezone.utc)
        },
        {
            "code": "CO",
            "name": "Colorado", 
            "country": "US",
            "model_type": "Municipal Reimbursement",
            "small_producer_revenue_threshold": Decimal("5000000"),
            "small_producer_tonnage_threshold": Decimal("1.0"),
            "effective_date": datetime(2024, 1, 1, tzinfo=timezone.utc)
        },
        {
            "code": "ME",
            "name": "Maine",
            "country": "US",
            "model_type": "State-Run Municipal Reimbursement",
            "small_producer_revenue_threshold": Decimal("2000000"),
            "small_producer_tonnage_threshold": Decimal("1.0"),
            "effective_date": datetime(2024, 1, 1, tzinfo=timezone.utc)
        },
        {
            "code": "MD",
            "name": "Maryland",
            "country": "US",
            "model_type": "Shared Responsibility",
            "small_producer_revenue_threshold": Decimal("2000000"),
            "small_producer_tonnage_threshold": Decimal("1.0"),
            "effective_date": datetime(2028, 7, 1, tzinfo=timezone.utc)
        },
        {
            "code": "MN",
            "name": "Minnesota",
            "country": "US",
            "model_type": "Shared Responsibility",
            "small_producer_revenue_threshold": Decimal("5000000"),
            "small_producer_tonnage_threshold": Decimal("1.0"),
            "effective_date": datetime(2029, 2, 1, tzinfo=timezone.utc)
        },
        {
            "code": "WA",
            "name": "Washington",
            "country": "US",
            "model_type": "Shared Responsibility",
            "small_producer_revenue_threshold": Decimal("5000000"),
            "small_producer_tonnage_threshold": Decimal("1.0"),
            "effective_date": datetime(2030, 2, 1, tzinfo=timezone.utc)
        },
        {
            "code": "EU",
            "name": "European Union",
            "country": "EU",
            "model_type": "PPWR Harmonized",
            "small_producer_revenue_threshold": None,
            "small_producer_tonnage_threshold": None,
            "effective_date": datetime(2024, 1, 1, tzinfo=timezone.utc)
        }
    ]
    
    jurisdiction_mapping = {}
    
    for jurisdiction_data in jurisdictions_data:
        existing = db.query(Jurisdiction).filter(
            Jurisdiction.code == jurisdiction_data["code"]
        ).first()
        
        if not existing:
            jurisdiction = Jurisdiction(**jurisdiction_data)
            db.add(jurisdiction)
            db.flush()  # Get the ID without committing
            jurisdiction_mapping[jurisdiction_data["code"]] = jurisdiction.id
        else:
            jurisdiction_mapping[jurisdiction_data["code"]] = existing.id
    
    return jurisdiction_mapping


def create_oregon_materials(db: Session, jurisdiction_id: str) -> List[str]:
    """Create Oregon's 60 material categories as defined by Circular Action Alliance."""
    
    oregon_materials = [
        {"name": "Paper - Corrugated Cardboard", "code": "OR-P-001", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Paper - Newspaper", "code": "OR-P-002", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Paper - Mixed Paper", "code": "OR-P-003", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Paper - Office Paper", "code": "OR-P-004", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Paper - Magazines", "code": "OR-P-005", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Paper - Paperboard", "code": "OR-P-006", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Paper - Kraft Paper", "code": "OR-P-007", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Paper - Wax Coated", "code": "OR-P-008", "recyclable": False, "level": 3, "contains_plastic": False},
        {"name": "Paper - Plastic Coated", "code": "OR-P-009", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Paper - Composite", "code": "OR-P-010", "recyclable": False, "level": 3, "contains_plastic": True},
        
        {"name": "Plastic - PET (#1) Bottles", "code": "OR-PL-001", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Plastic - PET (#1) Containers", "code": "OR-PL-002", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Plastic - HDPE (#2) Bottles", "code": "OR-PL-003", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Plastic - HDPE (#2) Containers", "code": "OR-PL-004", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Plastic - PVC (#3)", "code": "OR-PL-005", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Plastic - LDPE (#4) Film", "code": "OR-PL-006", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Plastic - LDPE (#4) Rigid", "code": "OR-PL-007", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Plastic - PP (#5) Containers", "code": "OR-PL-008", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Plastic - PP (#5) Film", "code": "OR-PL-009", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Plastic - PS (#6) Foam", "code": "OR-PL-010", "recyclable": False, "level": 3, "contains_plastic": True, "disrupts_recycling": True},
        {"name": "Plastic - PS (#6) Rigid", "code": "OR-PL-011", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Plastic - Other (#7)", "code": "OR-PL-012", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Plastic - Multilayer Film", "code": "OR-PL-013", "recyclable": False, "level": 3, "contains_plastic": True, "disrupts_recycling": True},
        {"name": "Plastic - Flexible Pouches", "code": "OR-PL-014", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Plastic - Rigid Thermoformed", "code": "OR-PL-015", "recyclable": True, "level": 3, "contains_plastic": True},
        
        {"name": "Glass - Clear Bottles", "code": "OR-G-001", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Glass - Brown Bottles", "code": "OR-G-002", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Glass - Green Bottles", "code": "OR-G-003", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Glass - Mixed Color", "code": "OR-G-004", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Glass - Jars", "code": "OR-G-005", "recyclable": True, "level": 3, "contains_plastic": False},
        
        {"name": "Metal - Aluminum Cans", "code": "OR-M-001", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Metal - Aluminum Foil", "code": "OR-M-002", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Metal - Steel Cans", "code": "OR-M-003", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Metal - Tin Cans", "code": "OR-M-004", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Metal - Mixed Metals", "code": "OR-M-005", "recyclable": True, "level": 3, "contains_plastic": False},
        
        {"name": "Composite - Aseptic Cartons", "code": "OR-C-001", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Composite - Gable Top Cartons", "code": "OR-C-002", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Composite - Multi-material Pouches", "code": "OR-C-003", "recyclable": False, "level": 3, "contains_plastic": True, "disrupts_recycling": True},
        {"name": "Composite - Laminated Paper", "code": "OR-C-004", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Composite - Metalized Film", "code": "OR-C-005", "recyclable": False, "level": 3, "contains_plastic": True},
        
        {"name": "Textile - Cotton Bags", "code": "OR-T-001", "recyclable": False, "level": 3, "contains_plastic": False},
        {"name": "Textile - Synthetic Bags", "code": "OR-T-002", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Textile - Woven Polypropylene", "code": "OR-T-003", "recyclable": False, "level": 3, "contains_plastic": True},
        
        {"name": "Wood - Pallets", "code": "OR-W-001", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Wood - Crates", "code": "OR-W-002", "recyclable": True, "level": 3, "contains_plastic": False},
        {"name": "Wood - Treated Wood", "code": "OR-W-003", "recyclable": False, "level": 3, "contains_plastic": False},
        
        {"name": "Electronic - Batteries", "code": "OR-E-001", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Electronic - Circuit Boards", "code": "OR-E-002", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Electronic - Cables", "code": "OR-E-003", "recyclable": True, "level": 3, "contains_plastic": True},
        
        {"name": "Hazardous - Paint Containers", "code": "OR-H-001", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Hazardous - Chemical Containers", "code": "OR-H-002", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Hazardous - Aerosol Cans", "code": "OR-H-003", "recyclable": True, "level": 3, "contains_plastic": False},
        
        {"name": "Specialty - Biodegradable Plastic", "code": "OR-S-001", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Specialty - Compostable Plastic", "code": "OR-S-002", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Specialty - Oxo-degradable Plastic", "code": "OR-S-003", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Specialty - Bioplastic", "code": "OR-S-004", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Specialty - Expanded Polystyrene", "code": "OR-S-005", "recyclable": False, "level": 3, "contains_plastic": True, "disrupts_recycling": True},
        
        {"name": "Mixed - Multi-material Packaging", "code": "OR-MX-001", "recyclable": False, "level": 3, "contains_plastic": True, "disrupts_recycling": True},
        {"name": "Mixed - Difficult to Separate", "code": "OR-MX-002", "recyclable": False, "level": 3, "contains_plastic": True, "disrupts_recycling": True},
        {"name": "Mixed - Small Format Packaging", "code": "OR-MX-003", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Mixed - Flexible Packaging", "code": "OR-MX-004", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Mixed - Rigid Packaging", "code": "OR-MX-005", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Mixed - Service Packaging", "code": "OR-MX-006", "recyclable": False, "level": 3, "contains_plastic": True},
        {"name": "Mixed - Transport Packaging", "code": "OR-MX-007", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Mixed - Consumer Packaging", "code": "OR-MX-008", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Mixed - Industrial Packaging", "code": "OR-MX-009", "recyclable": True, "level": 3, "contains_plastic": True},
        {"name": "Mixed - Agricultural Packaging", "code": "OR-MX-010", "recyclable": False, "level": 3, "contains_plastic": True}
    ]
    
    material_ids = []
    
    for material_data in oregon_materials:
        existing = db.query(MaterialCategory).filter(
            MaterialCategory.jurisdiction_id == jurisdiction_id,
            MaterialCategory.code == material_data["code"]
        ).first()
        
        if not existing:
            material = MaterialCategory(
                jurisdiction_id=jurisdiction_id,
                name=material_data["name"],
                code=material_data["code"],
                recyclable=material_data["recyclable"],
                level=material_data["level"],
                contains_plastic=material_data["contains_plastic"],
                disrupts_recycling=material_data.get("disrupts_recycling", False)
            )
            db.add(material)
            db.flush()
            material_ids.append(material.id)
        else:
            material_ids.append(existing.id)
    
    return material_ids


def create_california_cmc_materials(db: Session, jurisdiction_id: str) -> List[str]:
    """Create California's hierarchical CMC (Covered Material Category) list."""
    
    cmc_materials = [
        {"name": "Plastic - PET (#1) - Bottles", "code": "CA-PL-PET-BOT", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Plastic - PET (#1) - Thermoformed Containers", "code": "CA-PL-PET-THER", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Plastic - PET (#1) - Film", "code": "CA-PL-PET-FILM", "level": 3, "contains_plastic": True, "recyclable": False},
        {"name": "Plastic - HDPE (#2) - Bottles", "code": "CA-PL-HDPE-BOT", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Plastic - HDPE (#2) - Containers", "code": "CA-PL-HDPE-CON", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Plastic - HDPE (#2) - Film", "code": "CA-PL-HDPE-FILM", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Plastic - PVC (#3) - Rigid", "code": "CA-PL-PVC-RIG", "level": 3, "contains_plastic": True, "recyclable": False, "disrupts_recycling": True},
        {"name": "Plastic - LDPE (#4) - Film", "code": "CA-PL-LDPE-FILM", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Plastic - PP (#5) - Containers", "code": "CA-PL-PP-CON", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Plastic - PP (#5) - Film", "code": "CA-PL-PP-FILM", "level": 3, "contains_plastic": True, "recyclable": False},
        {"name": "Plastic - PS (#6) - Foam", "code": "CA-PL-PS-FOAM", "level": 3, "contains_plastic": True, "recyclable": False, "disrupts_recycling": True},
        {"name": "Plastic - PS (#6) - Rigid", "code": "CA-PL-PS-RIG", "level": 3, "contains_plastic": True, "recyclable": False},
        {"name": "Plastic - Other (#7) - Mixed", "code": "CA-PL-OTH-MIX", "level": 3, "contains_plastic": True, "recyclable": False},
        
        {"name": "Paper - Corrugated - Boxes", "code": "CA-PA-CORR-BOX", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Paper - Corrugated - Sheets", "code": "CA-PA-CORR-SHT", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Paper - Paperboard - Folding Cartons", "code": "CA-PA-PB-FOLD", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Paper - Paperboard - Rigid Boxes", "code": "CA-PA-PB-RIG", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Paper - Kraft - Bags", "code": "CA-PA-KRA-BAG", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Paper - Kraft - Wrapping", "code": "CA-PA-KRA-WRA", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Paper - Coated - Wax", "code": "CA-PA-COA-WAX", "level": 3, "contains_plastic": False, "recyclable": False},
        {"name": "Paper - Coated - Plastic", "code": "CA-PA-COA-PLA", "level": 3, "contains_plastic": True, "recyclable": False},
        
        {"name": "Glass - Container - Clear", "code": "CA-GL-CON-CLE", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Glass - Container - Brown", "code": "CA-GL-CON-BRO", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Glass - Container - Green", "code": "CA-GL-CON-GRE", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Glass - Container - Mixed", "code": "CA-GL-CON-MIX", "level": 3, "contains_plastic": False, "recyclable": True},
        
        {"name": "Metal - Aluminum - Cans", "code": "CA-ME-ALU-CAN", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Metal - Aluminum - Foil", "code": "CA-ME-ALU-FOI", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Metal - Steel - Cans", "code": "CA-ME-STE-CAN", "level": 3, "contains_plastic": False, "recyclable": True},
        {"name": "Metal - Steel - Containers", "code": "CA-ME-STE-CON", "level": 3, "contains_plastic": False, "recyclable": True},
        
        {"name": "Composite - Aseptic - Cartons", "code": "CA-CO-ASE-CAR", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Composite - Gable Top - Cartons", "code": "CA-CO-GAB-CAR", "level": 3, "contains_plastic": True, "recyclable": True},
        {"name": "Composite - Multi-layer - Pouches", "code": "CA-CO-MUL-POU", "level": 3, "contains_plastic": True, "recyclable": False, "disrupts_recycling": True},
        {"name": "Composite - Laminated - Film", "code": "CA-CO-LAM-FIL", "level": 3, "contains_plastic": True, "recyclable": False}
    ]
    
    material_ids = []
    
    for material_data in cmc_materials:
        existing = db.query(MaterialCategory).filter(
            MaterialCategory.jurisdiction_id == jurisdiction_id,
            MaterialCategory.code == material_data["code"]
        ).first()
        
        if not existing:
            material = MaterialCategory(
                jurisdiction_id=jurisdiction_id,
                name=material_data["name"],
                code=material_data["code"],
                recyclable=material_data["recyclable"],
                level=material_data["level"],
                contains_plastic=material_data["contains_plastic"],
                disrupts_recycling=material_data.get("disrupts_recycling", False)
            )
            db.add(material)
            db.flush()
            material_ids.append(material.id)
        else:
            material_ids.append(existing.id)
    
    return material_ids


def create_other_jurisdiction_materials(db: Session, jurisdiction_mapping: Dict[str, str]) -> Dict[str, List[str]]:
    """Create material categories for other jurisdictions (CO, ME, MD, MN, WA, EU)."""
    
    all_material_ids = {}
    
    standard_materials = [
        {"name": "Paper and Cardboard", "code": "STD-P-001", "recyclable": True, "level": 2, "contains_plastic": False},
        {"name": "Plastic Bottles and Containers", "code": "STD-PL-001", "recyclable": True, "level": 2, "contains_plastic": True},
        {"name": "Plastic Film and Flexible", "code": "STD-PL-002", "recyclable": False, "level": 2, "contains_plastic": True, "disrupts_recycling": True},
        {"name": "Glass Containers", "code": "STD-G-001", "recyclable": True, "level": 2, "contains_plastic": False},
        {"name": "Metal Cans and Containers", "code": "STD-M-001", "recyclable": True, "level": 2, "contains_plastic": False},
        {"name": "Composite Materials", "code": "STD-C-001", "recyclable": False, "level": 2, "contains_plastic": True, "disrupts_recycling": True},
        {"name": "Textiles", "code": "STD-T-001", "recyclable": False, "level": 2, "contains_plastic": False},
        {"name": "Wood and Natural Materials", "code": "STD-W-001", "recyclable": True, "level": 2, "contains_plastic": False},
        {"name": "Electronic Packaging", "code": "STD-E-001", "recyclable": True, "level": 2, "contains_plastic": True},
        {"name": "Hazardous Material Packaging", "code": "STD-H-001", "recyclable": False, "level": 2, "contains_plastic": False, "disrupts_recycling": True}
    ]
    
    for jurisdiction_code, jurisdiction_id in jurisdiction_mapping.items():
        if jurisdiction_code in ["OR", "CA"]:
            continue  # Skip Oregon and California as they have custom materials
            
        material_ids = []
        
        for material_data in standard_materials:
            custom_code = material_data["code"].replace("STD", jurisdiction_code)
            
            existing = db.query(MaterialCategory).filter(
                MaterialCategory.jurisdiction_id == jurisdiction_id,
                MaterialCategory.code == custom_code
            ).first()
            
            if not existing:
                material = MaterialCategory(
                    jurisdiction_id=jurisdiction_id,
                    name=material_data["name"],
                    code=custom_code,
                    recyclable=material_data["recyclable"],
                    level=material_data["level"],
                    contains_plastic=material_data["contains_plastic"],
                    disrupts_recycling=material_data.get("disrupts_recycling", False)
                )
                db.add(material)
                db.flush()
                material_ids.append(material.id)
            else:
                material_ids.append(existing.id)
        
        all_material_ids[jurisdiction_code] = material_ids
    
    return all_material_ids


def create_fee_rates(db: Session, jurisdiction_mapping: Dict[str, str], material_mappings: Dict[str, List[str]]):
    """Create fee rates for all jurisdictions and materials."""
    
    base_rates = {
        "OR": Decimal("0.75"),  # Oregon PRO-led system
        "CA": Decimal("0.85"),  # California with mitigation fund
        "CO": Decimal("0.65"),  # Colorado municipal reimbursement
        "ME": Decimal("0.70"),  # Maine state-run system
        "MD": Decimal("0.60"),  # Maryland shared responsibility
        "MN": Decimal("0.60"),  # Minnesota shared responsibility
        "WA": Decimal("0.65"),  # Washington shared responsibility
        "EU": Decimal("0.80")   # EU PPWR system
    }
    
    effective_date = datetime(2024, 1, 1, tzinfo=timezone.utc)
    
    for jurisdiction_code, jurisdiction_id in jurisdiction_mapping.items():
        base_rate = base_rates.get(jurisdiction_code, Decimal("0.50"))
        
        if jurisdiction_code == "OR":
            material_ids = material_mappings.get("OR", [])
        elif jurisdiction_code == "CA":
            material_ids = material_mappings.get("CA", [])
        else:
            material_ids = material_mappings.get(jurisdiction_code, [])
        
        for material_id in material_ids:
            existing = db.query(FeeRate).filter(
                FeeRate.jurisdiction_id == jurisdiction_id,
                FeeRate.material_category_id == material_id,
                FeeRate.effective_date == effective_date
            ).first()
            
            if not existing:
                material = db.query(MaterialCategory).filter(
                    MaterialCategory.id == material_id
                ).first()
                
                if material:
                    adjusted_rate = base_rate * Decimal("1.5") if not material.recyclable else base_rate
                    
                    fee_rate = FeeRate(
                        jurisdiction_id=jurisdiction_id,
                        material_category_id=material_id,
                        rate_per_unit=adjusted_rate,
                        effective_date=effective_date
                    )
                    db.add(fee_rate)


def create_eco_modulation_rules(db: Session, jurisdiction_mapping: Dict[str, str]):
    """Create eco-modulation rules for all jurisdictions."""
    
    effective_date = datetime(2024, 1, 1, tzinfo=timezone.utc)
    
    oregon_rules = [
        {
            "rule_name": "LCA Disclosure Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "has_lca_disclosure == true",
                "adjustment_percentage": -5.0,
                "description": "5% fee reduction for LCA disclosure"
            },
            "description": "Bonus A: Perform and disclose a Life Cycle Assessment (LCA)"
        },
        {
            "rule_name": "Environmental Impact Reduction Bonus",
            "rule_type": "bonus", 
            "logic_definition": {
                "condition": "has_environmental_impact_reduction == true",
                "adjustment_percentage": -10.0,
                "description": "10% fee reduction for demonstrated environmental impact reduction"
            },
            "description": "Bonus B: Demonstrate significant environmental impact reduction via an LCA"
        },
        {
            "rule_name": "Reusable Packaging Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "uses_reusable_packaging == true",
                "adjustment_percentage": -15.0,
                "description": "15% fee reduction for reusable or refillable packaging systems"
            },
            "description": "Bonus C: Transition to reusable or refillable packaging systems"
        }
    ]
    
    california_rules = [
        {
            "rule_name": "Recyclability Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "recyclability_score >= 75",
                "adjustment_percentage": -10.0,
                "description": "10% fee reduction for high recyclability"
            },
            "description": "Bonus for materials with high recyclability scores"
        },
        {
            "rule_name": "Plastic Content Penalty",
            "rule_type": "penalty",
            "logic_definition": {
                "condition": "has_plastic_component == true AND recycled_content_percentage < 25",
                "adjustment_percentage": 20.0,
                "description": "20% fee increase for plastic materials with low recycled content"
            },
            "description": "Penalty for plastic materials with insufficient recycled content"
        }
    ]
    
    colorado_rules = [
        {
            "rule_name": "PCR Content Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "recycled_content_percentage >= 30",
                "adjustment_percentage": -15.0,
                "description": "15% fee reduction for 30%+ post-consumer recycled content"
            },
            "description": "Bonus for high post-consumer recycled content"
        },
        {
            "rule_name": "Recycling Disruption Penalty",
            "rule_type": "penalty",
            "logic_definition": {
                "condition": "disrupts_recycling == true",
                "adjustment_percentage": 50.0,
                "description": "50% fee increase for materials that disrupt recycling streams"
            },
            "description": "Penalty for materials that disrupt recycling processes"
        },
        {
            "rule_name": "Reusability Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "reusable == true",
                "adjustment_percentage": -25.0,
                "description": "25% fee reduction for reusable packaging"
            },
            "description": "Bonus for reusable packaging systems"
        }
    ]
    
    maine_rules = [
        {
            "rule_name": "Non-Recyclable Penalty",
            "rule_type": "penalty",
            "logic_definition": {
                "condition": "recyclable == false",
                "adjustment_percentage": 200.0,
                "description": "2-5x fee increase for non-recyclable materials"
            },
            "description": "Penalty multiplier for non-recyclable materials (2-5x higher fees)"
        },
        {
            "rule_name": "PFAS Content Penalty",
            "rule_type": "penalty",
            "logic_definition": {
                "condition": "contains_pfas == true",
                "adjustment_percentage": 100.0,
                "description": "100% fee increase for packaging containing PFAS"
            },
            "description": "Penalty for packaging containing PFAS substances"
        },
        {
            "rule_name": "Phthalates Content Penalty",
            "rule_type": "penalty",
            "logic_definition": {
                "condition": "contains_phthalates == true",
                "adjustment_percentage": 75.0,
                "description": "75% fee increase for packaging containing phthalates"
            },
            "description": "Penalty for packaging containing phthalates"
        }
    ]
    
    shared_responsibility_rules = [
        {
            "rule_name": "Recyclability Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "recyclable == true",
                "adjustment_percentage": -10.0,
                "description": "10% fee reduction for recyclable materials"
            },
            "description": "Bonus for recyclable materials"
        },
        {
            "rule_name": "High PCR Content Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "recycled_content_percentage >= 50",
                "adjustment_percentage": -20.0,
                "description": "20% fee reduction for 50%+ recycled content"
            },
            "description": "Bonus for high recycled content"
        }
    ]
    
    eu_rules = [
        {
            "rule_name": "Marine Degradable Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "marine_degradable == true",
                "adjustment_percentage": -15.0,
                "description": "15% fee reduction for marine degradable materials"
            },
            "description": "Bonus for marine degradable packaging"
        },
        {
            "rule_name": "Marine Harmful Penalty",
            "rule_type": "penalty",
            "logic_definition": {
                "condition": "harmful_to_marine_life == true",
                "adjustment_percentage": 30.0,
                "description": "30% fee increase for materials harmful to marine life"
            },
            "description": "Penalty for materials harmful to marine ecosystems"
        },
        {
            "rule_name": "Bay Friendly Bonus",
            "rule_type": "bonus",
            "logic_definition": {
                "condition": "bay_friendly == true",
                "adjustment_percentage": -10.0,
                "description": "10% fee reduction for bay-friendly materials"
            },
            "description": "Bonus for bay-friendly packaging materials"
        }
    ]
    
    jurisdiction_rules = {
        "OR": oregon_rules,
        "CA": california_rules,
        "CO": colorado_rules,
        "ME": maine_rules,
        "MD": shared_responsibility_rules,
        "MN": shared_responsibility_rules,
        "WA": shared_responsibility_rules + [
            {
                "rule_name": "High Recycling Rate Exemption",
                "rule_type": "bonus",
                "logic_definition": {
                    "condition": "annual_recycling_rate >= 65",
                    "adjustment_percentage": -100.0,
                    "description": "Full exemption for materials with 65%+ recycling rate for 3 consecutive years"
                },
                "description": "Washington's unique recycling rate exemption (65% for 3 years, 70% from 2030)"
            }
        ],
        "EU": eu_rules
    }
    
    for jurisdiction_code, rules in jurisdiction_rules.items():
        jurisdiction_id = jurisdiction_mapping.get(jurisdiction_code)
        if not jurisdiction_id:
            continue
            
        for rule_data in rules:
            existing = db.query(EcoModificationRule).filter(
                EcoModificationRule.jurisdiction_id == jurisdiction_id,
                EcoModificationRule.rule_name == rule_data["rule_name"]
            ).first()
            
            if not existing:
                eco_rule = EcoModificationRule(
                    jurisdiction_id=jurisdiction_id,
                    rule_name=rule_data["rule_name"],
                    rule_type=rule_data["rule_type"],
                    logic_definition=rule_data["logic_definition"],
                    effective_date=effective_date
                )
                db.add(eco_rule)


def populate_all_jurisdictions():
    """Main function to populate all jurisdiction data."""
    
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    logger.info("Starting EPR jurisdiction data population...")
    
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        logger.info("Creating jurisdictions...")
        jurisdiction_mapping = create_jurisdictions(db)
        db.commit()
        logger.info(f"Created {len(jurisdiction_mapping)} jurisdictions")
        
        logger.info("Creating material categories...")
        material_mappings = {}
        
        oregon_materials = create_oregon_materials(db, jurisdiction_mapping["OR"])
        material_mappings["OR"] = oregon_materials
        logger.info(f"Created {len(oregon_materials)} Oregon material categories")
        
        california_materials = create_california_cmc_materials(db, jurisdiction_mapping["CA"])
        material_mappings["CA"] = california_materials
        logger.info(f"Created {len(california_materials)} California CMC categories")
        
        other_materials = create_other_jurisdiction_materials(db, jurisdiction_mapping)
        material_mappings.update(other_materials)
        for jurisdiction, materials in other_materials.items():
            logger.info(f"Created {len(materials)} {jurisdiction} material categories")
        
        db.commit()
        
        logger.info("Creating fee rates...")
        create_fee_rates(db, jurisdiction_mapping, material_mappings)
        db.commit()
        logger.info("Fee rates created successfully")
        
        logger.info("Creating eco-modulation rules...")
        create_eco_modulation_rules(db, jurisdiction_mapping)
        db.commit()
        logger.info("Eco-modulation rules created successfully")
        
        logger.info("EPR jurisdiction data population completed successfully!")
        
        total_jurisdictions = db.query(Jurisdiction).count()
        total_materials = db.query(MaterialCategory).count()
        total_fee_rates = db.query(FeeRate).count()
        total_eco_rules = db.query(EcoModificationRule).count()
        
        logger.info(f"\nSummary:")
        logger.info(f"- Jurisdictions: {total_jurisdictions}")
        logger.info(f"- Material Categories: {total_materials}")
        logger.info(f"- Fee Rates: {total_fee_rates}")
        logger.info(f"- Eco-Modulation Rules: {total_eco_rules}")
        
    except Exception as e:
        logger.error(f"Error during population: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    populate_all_jurisdictions()
