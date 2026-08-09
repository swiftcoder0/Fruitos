from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas
from ..utils.qr import generate_qr_base64
import random

# ✅ Import demand & risk logic for the list endpoint
from ..logic.demand import get_expected_demand
from ..logic.risk import detect_waste_risk

router = APIRouter(
    prefix="/batches",
    tags=["batches"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.BatchResponse)
def create_batch(batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    # Check if crop exists
    crop = db.query(models.Crop).filter(models.Crop.id == batch.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    # Generate a unique batch ID: e.g., MNG-001
    commodity_code = crop.commodity[:3].upper()
    # Get count of existing batches for this crop to generate sequential number
    count = db.query(models.Batch).filter(models.Batch.crop_id == crop.id).count()
    batch_number = f"{count + 1:03d}"   # 001, 002, ...
    batch_id = f"{commodity_code}-{batch_number}"

    # Create batch instance
    db_batch = models.Batch(
        batch_id=batch_id,
        crop_id=batch.crop_id,
        quantity_kg=batch.quantity_kg,
        origin=batch.origin,
        current_location=batch.origin,
        destination=batch.destination,
        harvest_time=datetime.utcnow(),
        status="healthy"
    )

    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)

    # Generate QR code (after commit, so we have the ID)
    qr_base64 = generate_qr_base64(db_batch.batch_id)
    db_batch.qr_code_base64 = qr_base64
    db.commit()
    db.refresh(db_batch)

    return db_batch

@router.get("/{batch_id}", response_model=schemas.BatchResponse)
def get_batch(batch_id: str, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

# ✅ NEW: List all batches with risk info (for Manager Control Center)
@router.get("/")
def list_batches(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    List all batches with crop and risk info.
    Used by Manager Control Center.
    """
    batches = db.query(models.Batch).offset(skip).limit(limit).all()
    result = []
    for batch in batches:
        crop = db.query(models.Crop).filter(models.Crop.id == batch.crop_id).first()
        # Compute demand and risk
        expected_demand = get_expected_demand(
            commodity=crop.commodity if crop else "Mango",
            variety=crop.variety if crop else "Dashehari",
            location=batch.current_location
        )
        risk_info = detect_waste_risk(batch.quantity_kg, expected_demand)
        result.append({
            "id": batch.id,
            "batch_id": batch.batch_id,
            "commodity": crop.commodity if crop else "Unknown",
            "variety": crop.variety if crop else "",
            "quantity_kg": batch.quantity_kg,
            "current_location": batch.current_location,
            "remaining_life_days": batch.remaining_life_days,
            "quality_index": batch.quality_index,
            "risk_level": risk_info["risk_level"],
            "at_risk_kg": risk_info["at_risk_kg"],
            "status": batch.status,
        })
    return result