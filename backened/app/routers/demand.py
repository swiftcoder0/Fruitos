from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from ..logic.demand import get_expected_demand

router = APIRouter(
    prefix="/demand",
    tags=["demand"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{batch_id}")
def get_batch_demand(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    crop = db.query(models.Crop).filter(models.Crop.id == batch.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    expected_demand = get_expected_demand(
        commodity=crop.commodity,
        variety=crop.variety,
        location=batch.current_location
    )
    
    return {
        "batch_id": batch.id,
        "batch_identifier": batch.batch_id,
        "commodity": crop.commodity,
        "variety": crop.variety,
        "location": batch.current_location,
        "inventory_kg": batch.quantity_kg,
        "expected_demand_kg": expected_demand,
        "remaining_life_days": batch.remaining_life_days,
        "potential_excess_kg": max(0, batch.quantity_kg - expected_demand)
    }