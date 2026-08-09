from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from ..logic.demand import get_expected_demand
from ..logic.risk import detect_waste_risk

router = APIRouter(
    prefix="/risk",
    tags=["risk"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{batch_id}")
def get_batch_risk(batch_id: int, db: Session = Depends(get_db)):
    """
    Detect waste risk for a specific batch.
    Returns at-risk quantity and risk level.
    """
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    crop = db.query(models.Crop).filter(models.Crop.id == batch.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    # Get expected demand for this batch's current location
    expected_demand = get_expected_demand(
        commodity=crop.commodity,
        variety=crop.variety,
        location=batch.current_location
    )
    
    # Detect risk
    risk_result = detect_waste_risk(
        inventory_kg=batch.quantity_kg,
        expected_demand_kg=expected_demand
    )
    
    return {
        "batch_id": batch.id,
        "batch_identifier": batch.batch_id,
        "commodity": crop.commodity,
        "variety": crop.variety,
        "location": batch.current_location,
        "remaining_life_days": batch.remaining_life_days,
        "quality_index": batch.quality_index,
        "risk": risk_result
    }