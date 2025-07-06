from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db, Organization
from ..auth import get_current_user
from ..schemas import User as UserSchema
import csv
import io
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/bulk", tags=["bulk"])

def parse_csv_file(file_content: str) -> List[Dict[str, Any]]:
    """Parse CSV content and return list of dictionaries"""
    try:
        csv_reader = csv.DictReader(io.StringIO(file_content))
        return [row for row in csv_reader]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

def validate_product_row(row: Dict[str, Any], row_number: int) -> Dict[str, Any]:
    """Validate and clean a product row"""
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
    
    if errors:
        raise ValueError("; ".join(errors))
    
    return {
        "id": str(uuid.uuid4()),
        "name": row['name'].strip(),
        "sku": row['sku'].strip(),
        "category": row.get('category', '').strip(),
        "weight": weight,
        "description": row.get('description', '').strip(),
        "upc": row.get('upc', '').strip(),
        "manufacturer": row.get('manufacturer', '').strip(),
        "created_at": datetime.now().isoformat(),
        "imported": True
    }

def validate_material_row(row: Dict[str, Any], row_number: int) -> Dict[str, Any]:
    """Validate and clean a material row"""
    errors = []
    
    if not row.get('name', '').strip():
        errors.append(f"Row {row_number}: Material name is required")
    
    if not row.get('category', '').strip():
        errors.append(f"Row {row_number}: Category is required")
    
    recyclable_str = row.get('recyclable', '').lower()
    if recyclable_str in ['true', '1', 'yes']:
        recyclable = True
    elif recyclable_str in ['false', '0', 'no']:
        recyclable = False
    else:
        errors.append(f"Row {row_number}: Recyclable must be true/false")
        recyclable = False
    
    try:
        epr_rate = float(row.get('eprRate', 0))
        if epr_rate < 0:
            errors.append(f"Row {row_number}: EPR rate cannot be negative")
    except (ValueError, TypeError):
        errors.append(f"Row {row_number}: Invalid EPR rate value")
        epr_rate = 0
    
    try:
        sustainability_score = int(row.get('sustainabilityScore', 0))
        if not 0 <= sustainability_score <= 100:
            errors.append(f"Row {row_number}: Sustainability score must be between 0-100")
    except (ValueError, TypeError):
        errors.append(f"Row {row_number}: Invalid sustainability score")
        sustainability_score = 0
    
    if errors:
        raise ValueError("; ".join(errors))
    
    return {
        "id": str(uuid.uuid4()),
        "name": row['name'].strip(),
        "category": row['category'].strip(),
        "type": row.get('type', '').strip(),
        "recyclable": recyclable,
        "eprRate": epr_rate,
        "sustainabilityScore": sustainability_score,
        "description": row.get('description', '').strip(),
        "created_at": datetime.now().isoformat(),
        "imported": True
    }

@router.post("/import/products")
async def import_products(
    file: UploadFile = File(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import products from CSV file"""
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
        
        existing_products = getattr(organization, 'products', '[]')
        if isinstance(existing_products, str):
            try:
                products_list = json.loads(existing_products)
            except:
                products_list = []
        else:
            products_list = existing_products or []
        
        successful = 0
        failed = 0
        errors = []
        
        for i, row in enumerate(rows, 1):
            try:
                validated_product = validate_product_row(row, i)
                products_list.append(validated_product)
                successful += 1
            except ValueError as e:
                failed += 1
                errors.append({
                    "row": i,
                    "error": str(e),
                    "data": row
                })
        
        if not hasattr(organization, 'products'):
            setattr(organization, 'products', json.dumps(products_list))
        else:
            organization.products = json.dumps(products_list)
        
        db.commit()
        db.refresh(organization)
        
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
    """Import materials from CSV file"""
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
        
        existing_materials = getattr(organization, 'materials', '[]')
        if isinstance(existing_materials, str):
            try:
                materials_list = json.loads(existing_materials)
            except:
                materials_list = []
        else:
            materials_list = existing_materials or []
        
        successful = 0
        failed = 0
        errors = []
        
        for i, row in enumerate(rows, 1):
            try:
                validated_material = validate_material_row(row, i)
                materials_list.append(validated_material)
                successful += 1
            except ValueError as e:
                failed += 1
                errors.append({
                    "row": i,
                    "error": str(e),
                    "data": row
                })
        
        if not hasattr(organization, 'materials'):
            setattr(organization, 'materials', json.dumps(materials_list))
        else:
            organization.materials = json.dumps(materials_list)
        
        db.commit()
        db.refresh(organization)
        
        return {
            "total": len(rows),
            "successful": successful,
            "failed": failed,
            "errors": errors[:10]  # Limit to first 10 errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
