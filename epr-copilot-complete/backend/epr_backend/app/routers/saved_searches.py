from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, SavedSearch
from ..schemas import SavedSearchCreate, SavedSearch as SavedSearchSchema
from ..auth import get_current_user

router = APIRouter(prefix="/api/saved-searches", tags=["saved-searches"])


@router.get("/", response_model=List[SavedSearchSchema])
async def get_saved_searches(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all saved searches for the current user's organization."""
    searches = db.query(SavedSearch).filter(
        SavedSearch.organization_id == current_user.organization_id
    ).order_by(SavedSearch.created_at.desc()).all()
    return searches


@router.post("/", response_model=SavedSearchSchema)
async def create_saved_search(
    search: SavedSearchCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new saved search."""
    db_search = SavedSearch(
        **search.dict(),
        organization_id=current_user.organization_id
    )
    db.add(db_search)
    db.commit()
    db.refresh(db_search)
    return db_search


@router.delete("/{search_id}")
async def delete_saved_search(
    search_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a saved search."""
    search = db.query(SavedSearch).filter(
        SavedSearch.id == search_id,
        SavedSearch.organization_id == current_user.organization_id
    ).first()
    if not search:
        raise HTTPException(status_code=404, detail="Saved search not found")

    db.delete(search)
    db.commit()
    return {"message": "Saved search deleted successfully"}
