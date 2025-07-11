from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from ..database import get_db, Product, Material
from ..schemas import ProductCreate, Product as ProductSchema, ProductForm, Material as MaterialSchema
from ..auth import get_current_user
from ..utils.field_converter import convert_frontend_fields

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/", response_model=List[ProductSchema])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all products for the current user's organization."""
    query = db.query(Product).filter(
        Product.organization_id == current_user.organization_id
    ).options(selectinload(Product.packaging_components))
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.post("/", response_model=ProductSchema)
async def create_product(
    product: ProductForm,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product."""
    product_data = product.to_backend_fields()
    
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
    product_update: ProductForm,
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

    product_data = product_update.to_backend_fields()

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
