from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db, Product, Material
from ..schemas import ProductCreate, Product as ProductSchema, Material as MaterialSchema
from ..auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/", response_model=List[ProductSchema])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all products for the current user's organization."""
    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id
    ).offset(skip).limit(limit).all()
    return products


@router.post("/", response_model=ProductSchema)
async def create_product(
    product: ProductCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product."""
    product_data = product.dict()
    
    if 'designatedProducerId' in product_data:
        product_data['designated_producer_id'] = product_data.pop('designatedProducerId')
    
    db_product = Product(
        **product_data,
        organization_id=current_user.organization_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(
    product_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific product."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: str,
    product_update: ProductCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a product."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product_data = product_update.dict()
    
    if 'designatedProducerId' in product_data:
        product_data['designated_producer_id'] = product_data.pop('designatedProducerId')

    for field, value in product_data.items():
        if hasattr(product, field):
            setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a product."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
