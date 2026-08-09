from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import SessionLocal
from .. import models, schemas
from ..logic.shelf_life import calculate_remaining_life   # <-- NEW IMPORT

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/temperature", response_model=schemas.EventResponse)
def log_temperature(
    batch_id: int,
    temperature_c: float,
    location: str = "Unknown",
    description: str = None,
    db: Session = Depends(get_db)
):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # 1. Log the event
    event = models.BatchEvent(
        batch_id=batch_id,
        event_type="temperature",
        temperature_c=temperature_c,
        location=location,
        description=description or f"Temperature reading: {temperature_c}°C",
        timestamp=datetime.utcnow()
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # ----------------------------------------------
    # 2. 🧠 SHELF-LIFE ENGINE - RECALCULATE LIFE
    # ----------------------------------------------
    temp_readings = db.query(models.BatchEvent).filter(
        models.BatchEvent.batch_id == batch_id,
        models.BatchEvent.event_type == "temperature"
    ).all()
    
    readings = [
        {"temperature_c": r.temperature_c, "timestamp": r.timestamp}
        for r in temp_readings if r.temperature_c is not None
    ]
    
    crop = db.query(models.Crop).filter(models.Crop.id == batch.crop_id).first()
    commodity = crop.commodity if crop else "Mango"
    
    remaining = calculate_remaining_life(
        commodity=commodity,
        quality_index=batch.quality_index,
        temperature_readings=readings
    )
    batch.remaining_life_days = remaining
    db.commit()
    # ----------------------------------------------

    return event

@router.post("/location", response_model=schemas.EventResponse)
def log_location(
    batch_id: int,
    location: str,
    description: str = None,
    db: Session = Depends(get_db)
):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    event = models.BatchEvent(
        batch_id=batch_id,
        event_type="location",
        location=location,
        description=description or f"Moved to {location}",
        timestamp=datetime.utcnow()
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    batch.current_location = location
    db.commit()

    return event

@router.get("/batch/{batch_id}", response_model=list[schemas.EventResponse])
def get_batch_events(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    events = db.query(models.BatchEvent).filter(
        models.BatchEvent.batch_id == batch_id
    ).order_by(models.BatchEvent.timestamp).all()
    return events