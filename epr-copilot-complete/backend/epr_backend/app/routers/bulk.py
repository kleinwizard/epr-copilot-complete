from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from ..database import get_db, Organization, Product, Material
from ..auth import get_current_user
from ..schemas import User as UserSchema
from ..utils.field_converter import camel_to_snake
import csv
import io
import json
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/api/bulk", tags=["bulk"])

def parse_csv_file(file_content: str) -> List[Dict[str, Any]]:
    """Parse CSV content and return list of dictionaries"""
    try:
        csv_reader = csv.DictReader(io.StringIO(file_content))
        return [row for row in csv_reader]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

def validate_product_row(row: Dict[str, Any], row_number: int, organization_id: str) -> Dict[str, Any]:
    """Validate and clean a product row for database insertion"""
    errors = []
    
    if not row.get('name', '').strip():
        errors.append(f"Row {row_number}: Product name is required")
    
    if not row.get('sku', '').strip():
        errors.append(f"Row {row_number}: SKU is required")
    
    try:
        weight = float(row.get('weight', 0))
        if weight <= 0:
            errors.append(f"Row {row_number}: Weight must be greater than 0")
    except (ValueError, TypeError):
        errors.append(f"Row {row_number}: Invalid weight value")
        weight = 0
    
    try:
        units_sold = int(row.get('units_sold', 0))
        if units_sold < 0:
            errors.append(f"Row {row_number}: Units sold cannot be negative")
    except (ValueError, TypeError):
        errors.append(f"Row {row_number}: Invalid units sold value")
        units_sold = 0
    
    if errors:
        raise ValueError("; ".join(errors))
    
    return {
        "id": str(uuid.uuid4()),
        "organization_id": organization_id,
        "name": row['name'].strip(),
        "sku": row['sku'].strip(),
        "category": row.get('category', '').strip() or None,
        "weight": weight,
        "units_sold": units_sold,
        "description": row.get('description', '').strip() or None,
        "upc": row.get('upc', '').strip() or None,
        "manufacturer": row.get('manufacturer', '').strip() or None,
        "created_at": datetime.now(timezone.utc)
    }

def validate_material_row(row: Dict[str, Any], row_number: int, organization_id: str) -> Dict[str, Any]:
    """Validate and clean a material row for database insertion"""
    errors = []
    
    if not row.get('name', '').strip():
        errors.append(f"Row {row_number}: Material name is required")
    
    recyclable_str = row.get('recyclable', '').lower()
    if recyclable_str in ['true', '1', 'yes']:
        recyclable = True
    elif recyclable_str in ['false', '0', 'no']:
        recyclable = False
    else:
        errors.append(f"Row {row_number}: Recyclable must be true/false")
        recyclable = False
    
    try:
        epr_rate = float(row.get('epr_rate', row.get('eprRate', 0)))
        if epr_rate < 0:
            errors.append(f"Row {row_number}: EPR rate cannot be negative")
    except (ValueError, TypeError):
        errors.append(f"Row {row_number}: Invalid EPR rate value")
        epr_rate = 0
    
    if errors:
        raise ValueError("; ".join(errors))
    
    return {
        "id": str(uuid.uuid4()),
        "organization_id": organization_id,
        "name": row['name'].strip(),
        "epr_rate": epr_rate,
        "recyclable": recyclable,
        "created_at": datetime.now(timezone.utc)
    }

@router.post("/import/products")
async def import_products(
    file: UploadFile = File(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import products from CSV file using bulk operations"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        content = await file.read()
        file_content = content.decode('utf-8')
        
        rows = parse_csv_file(file_content)
        
        if not rows:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        existing_skus = set(
            sku[0] for sku in db.query(Product.sku).filter(
                Product.organization_id == current_user.organization_id
            ).all()
        )
        
        successful = 0
        failed = 0
        errors = []
        products_to_insert = []
        
        for i, row in enumerate(rows, 1):
            try:
                validated_product = validate_product_row(row, i, current_user.organization_id)
                
                if validated_product['sku'] in existing_skus:
                    failed += 1
                    errors.append({
                        "row": i,
                        "error": f"SKU '{validated_product['sku']}' already exists",
                        "data": row
                    })
                    continue
                
                products_to_insert.append(validated_product)
                existing_skus.add(validated_product['sku'])
                successful += 1
                
            except ValueError as e:
                failed += 1
                errors.append({
                    "row": i,
                    "error": str(e),
                    "data": row
                })
        
        if products_to_insert:
            db.bulk_insert_mappings(Product, products_to_insert)
            db.commit()
        
        return {
            "total": len(rows),
            "successful": successful,
            "failed": failed,
            "errors": errors[:10]  # Limit to first 10 errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@router.post("/import/materials")
async def import_materials(
    file: UploadFile = File(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import materials from CSV file using bulk operations"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        content = await file.read()
        file_content = content.decode('utf-8')
        
        rows = parse_csv_file(file_content)
        
        if not rows:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        existing_names = set(
            name[0] for name in db.query(Material.name).filter(
                Material.organization_id == current_user.organization_id
            ).all()
        )
        
        successful = 0
        failed = 0
        errors = []
        materials_to_insert = []
        
        for i, row in enumerate(rows, 1):
            try:
                validated_material = validate_material_row(row, i, current_user.organization_id)
                
                if validated_material['name'] in existing_names:
                    failed += 1
                    errors.append({
                        "row": i,
                        "error": f"Material '{validated_material['name']}' already exists",
                        "data": row
                    })
                    continue
                
                materials_to_insert.append(validated_material)
                existing_names.add(validated_material['name'])
                successful += 1
                
            except ValueError as e:
                failed += 1
                errors.append({
                    "row": i,
                    "error": str(e),
                    "data": row
                })
        
        if materials_to_insert:
            db.bulk_insert_mappings(Material, materials_to_insert)
            db.commit()
        
        return {
            "total": len(rows),
            "successful": successful,
            "failed": failed,
            "errors": errors[:10]  # Limit to first 10 errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
