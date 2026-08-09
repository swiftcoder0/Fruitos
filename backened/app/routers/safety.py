from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from ..logic.safety import check_storage_safety

router = APIRouter(
    prefix="/safety",
    tags=["safety"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/check/{batch_id}")
def check_batch_safety(
    batch_id: int,
    storage_temp: float,
    db: Session = Depends(get_db)
):
    """
    Check if a storage temperature is safe for a batch's commodity.
    Returns safety status with reason.
    """
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    crop = db.query(models.Crop).filter(models.Crop.id == batch.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    result = check_storage_safety(
        commodity=crop.commodity,
        storage_temp=storage_temp
    )
    
    return {
        "batch_id": batch.id,
        "batch_identifier": batch.batch_id,
        "commodity": crop.commodity,
        "storage_temp": storage_temp,
        **result
    }