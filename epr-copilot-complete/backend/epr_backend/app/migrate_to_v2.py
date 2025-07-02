"""
Data migration scripts for EPR v2.0 schema upgrade.

This module provides functions to safely migrate existing v1.0 data to the new v2.0 schema
while preserving data integrity and ensuring backward compatibility.
"""

from decimal import Decimal
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import (
    Organization, ProducerProfile, PackagingComponent, Product,
    EntityRole, ProductProducerDesignation
)


def migrate_existing_organizations_to_entity_roles(db: Session) -> Dict[str, Any]:
    """
    Migrate existing organizations to have default BRAND_OWNER role.
    
    This function creates EntityRole records for all existing organizations,
    assigning them the default BRAND_OWNER role for backward compatibility.
    
    Args:
        db: Database session
        
    Returns:
        Migration result summary
    """
    try:
        organizations_without_roles = db.execute(text("""
            SELECT o.id, o.name 
            FROM organizations o 
            LEFT JOIN entity_roles er ON o.id = er.organization_id 
            WHERE er.id IS NULL
        """)).fetchall()
        
        migrated_count = 0
        
        for org_row in organizations_without_roles:
            org_id, org_name = org_row
            
            entity_role = EntityRole(
                organization_id=org_id,
                role_type="BRAND_OWNER",
                jurisdiction_id=None,  # Global role
                parent_entity_id=None,
                is_active=True
            )
            
            db.add(entity_role)
            migrated_count += 1
            
        db.commit()
        
        return {
            "success": True,
            "migrated_organizations": migrated_count,
            "message": f"Successfully migrated {migrated_count} organizations to have BRAND_OWNER roles"
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to migrate organizations to entity roles: {str(e)}"
        }


def migrate_packaging_components_to_v2(db: Session) -> Dict[str, Any]:
    """
    Add default values for new v2.0 packaging component fields.
    
    This function updates existing PackagingComponent records to include
    default values for new v2.0 fields while preserving existing data.
    
    Args:
        db: Database session
        
    Returns:
        Migration result summary
    """
    try:
        components_to_update = db.execute(text("""
            SELECT id, component_name, material_category_id 
            FROM packaging_components 
            WHERE packaging_level IS NULL
        """)).fetchall()
        
        updated_count = 0
        
        for component_row in components_to_update:
            component_id, component_name, material_category_id = component_row
            
            packaging_level = _determine_default_packaging_level(component_name)
            
            db.execute(text("""
                UPDATE packaging_components 
                SET 
                    packaging_level = :packaging_level,
                    is_beverage_container = FALSE,
                    is_medical_exempt = FALSE,
                    is_fifra_exempt = FALSE,
                    ca_plastic_component_flag = FALSE,
                    me_toxicity_flag = FALSE
                WHERE id = :component_id
            """), {
                "packaging_level": packaging_level,
                "component_id": component_id
            })
            
            updated_count += 1
            
        db.commit()
        
        return {
            "success": True,
            "updated_components": updated_count,
            "message": f"Successfully updated {updated_count} packaging components with v2.0 defaults"
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to migrate packaging components: {str(e)}"
        }


def migrate_producer_profiles_to_v2(db: Session) -> Dict[str, Any]:
    """
    Update existing ProducerProfile records with v2.0 default values.
    
    This function adds default values for new v2.0 fields in ProducerProfile
    while preserving existing producer data.
    
    Args:
        db: Database session
        
    Returns:
        Migration result summary
    """
    try:
        result = db.execute(text("""
            UPDATE producer_profiles 
            SET 
                annual_revenue_scope = 'GLOBAL',
                produces_perishable_food = FALSE
            WHERE annual_revenue_scope IS NULL OR produces_perishable_food IS NULL
        """))
        
        updated_count = result.rowcount
        db.commit()
        
        return {
            "success": True,
            "updated_profiles": updated_count,
            "message": f"Successfully updated {updated_count} producer profiles with v2.0 defaults"
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to migrate producer profiles: {str(e)}"
        }


def create_default_product_producer_designations(db: Session) -> Dict[str, Any]:
    """
    Create default ProductProducerDesignation records for existing products.
    
    This function creates producer designations for existing products,
    linking them to their organization as the default responsible producer.
    
    Args:
        db: Database session
        
    Returns:
        Migration result summary
    """
    try:
        products_without_designations = db.execute(text("""
            SELECT p.id, p.organization_id 
            FROM products p 
            LEFT JOIN product_producer_designations ppd ON p.id = ppd.product_id 
            WHERE ppd.id IS NULL
        """)).fetchall()
        
        created_count = 0
        
        for product_row in products_without_designations:
            product_id, organization_id = product_row
            
            designation = ProductProducerDesignation(
                product_id=product_id,
                designated_producer_id=organization_id,
                jurisdiction_id=None  # Global designation
            )
            
            db.add(designation)
            created_count += 1
            
        db.commit()
        
        return {
            "success": True,
            "created_designations": created_count,
            "message": f"Successfully created {created_count} default producer designations"
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to create producer designations: {str(e)}"
        }


def run_full_v2_migration(db: Session) -> Dict[str, Any]:
    """
    Execute the complete v2.0 data migration process.
    
    This function runs all migration steps in the correct order and provides
    a comprehensive summary of the migration results.
    
    Args:
        db: Database session
        
    Returns:
        Complete migration result summary
    """
    migration_results = {
        "overall_success": True,
        "migration_steps": [],
        "total_records_migrated": 0,
        "errors": []
    }
    
    org_result = migrate_existing_organizations_to_entity_roles(db)
    migration_results["migration_steps"].append({
        "step": "organizations_to_entity_roles",
        "result": org_result
    })
    
    if org_result["success"]:
        migration_results["total_records_migrated"] += org_result["migrated_organizations"]
    else:
        migration_results["overall_success"] = False
        migration_results["errors"].append(org_result["message"])
    
    component_result = migrate_packaging_components_to_v2(db)
    migration_results["migration_steps"].append({
        "step": "packaging_components_to_v2",
        "result": component_result
    })
    
    if component_result["success"]:
        migration_results["total_records_migrated"] += component_result["updated_components"]
    else:
        migration_results["overall_success"] = False
        migration_results["errors"].append(component_result["message"])
    
    profile_result = migrate_producer_profiles_to_v2(db)
    migration_results["migration_steps"].append({
        "step": "producer_profiles_to_v2",
        "result": profile_result
    })
    
    if profile_result["success"]:
        migration_results["total_records_migrated"] += profile_result["updated_profiles"]
    else:
        migration_results["overall_success"] = False
        migration_results["errors"].append(profile_result["message"])
    
    designation_result = create_default_product_producer_designations(db)
    migration_results["migration_steps"].append({
        "step": "default_producer_designations",
        "result": designation_result
    })
    
    if designation_result["success"]:
        migration_results["total_records_migrated"] += designation_result["created_designations"]
    else:
        migration_results["overall_success"] = False
        migration_results["errors"].append(designation_result["message"])
    
    return migration_results


def _determine_default_packaging_level(component_name: str) -> str:
    """
    Determine default packaging level based on component name heuristics.
    
    Args:
        component_name: Name of the packaging component
        
    Returns:
        Default packaging level
    """
    if not component_name:
        return "PRIMARY"
        
    component_lower = component_name.lower()
    
    if any(keyword in component_lower for keyword in ["shipping", "mailer", "envelope", "box"]):
        return "ECOM_SHIPPER"
    
    if any(keyword in component_lower for keyword in ["case", "carton", "multipack", "bundle"]):
        return "SECONDARY"
    
    if any(keyword in component_lower for keyword in ["pallet", "shrink", "wrap", "stretch"]):
        return "TERTIARY"
    
    if any(keyword in component_lower for keyword in ["cup", "plate", "utensil", "napkin", "straw"]):
        return "SERVICE_WARE"
    
    return "PRIMARY"


def validate_v2_migration(db: Session) -> Dict[str, Any]:
    """
    Validate that the v2.0 migration was successful.
    
    This function performs validation checks to ensure data integrity
    after the migration process.
    
    Args:
        db: Database session
        
    Returns:
        Validation result summary
    """
    validation_results = {
        "validation_passed": True,
        "checks": [],
        "warnings": [],
        "errors": []
    }
    
    try:
        orgs_without_roles = db.execute(text("""
            SELECT COUNT(*) as count 
            FROM organizations o 
            LEFT JOIN entity_roles er ON o.id = er.organization_id 
            WHERE er.id IS NULL
        """)).scalar()
        
        validation_results["checks"].append({
            "check": "organizations_have_entity_roles",
            "passed": orgs_without_roles == 0,
            "details": f"{orgs_without_roles} organizations without entity roles"
        })
        
        if orgs_without_roles > 0:
            validation_results["validation_passed"] = False
            validation_results["errors"].append(f"{orgs_without_roles} organizations missing entity roles")
        
        components_without_level = db.execute(text("""
            SELECT COUNT(*) as count 
            FROM packaging_components 
            WHERE packaging_level IS NULL
        """)).scalar()
        
        validation_results["checks"].append({
            "check": "components_have_packaging_level",
            "passed": components_without_level == 0,
            "details": f"{components_without_level} components without packaging_level"
        })
        
        if components_without_level > 0:
            validation_results["validation_passed"] = False
            validation_results["errors"].append(f"{components_without_level} components missing packaging_level")
        
        profiles_missing_v2_fields = db.execute(text("""
            SELECT COUNT(*) as count 
            FROM producer_profiles 
            WHERE annual_revenue_scope IS NULL OR produces_perishable_food IS NULL
        """)).scalar()
        
        validation_results["checks"].append({
            "check": "profiles_have_v2_fields",
            "passed": profiles_missing_v2_fields == 0,
            "details": f"{profiles_missing_v2_fields} profiles missing v2.0 fields"
        })
        
        if profiles_missing_v2_fields > 0:
            validation_results["validation_passed"] = False
            validation_results["errors"].append(f"{profiles_missing_v2_fields} profiles missing v2.0 fields")
        
        return validation_results
        
    except Exception as e:
        validation_results["validation_passed"] = False
        validation_results["errors"].append(f"Validation failed: {str(e)}")
        return validation_results
