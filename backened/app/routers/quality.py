from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from ..logic.quality import analyze_quality
from ..logic.shelf_life import calculate_remaining_life

router = APIRouter(
    prefix="/quality",
    tags=["quality"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/inspect")
async def inspect_batch(
    batch_id: int = Query(..., description="Batch numeric ID"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an image for quality inspection.
    Uses batch_id (int) — consistent with every other endpoint
    (/decisions/{batch_id}, /events/temperature?batch_id=, etc.)
    """
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch id {batch_id} not found")

    image_bytes = await file.read()
    result = analyze_quality(image_bytes)

    batch.quality_index = result["quality_index"]
    batch.ripeness = result["ripeness"]
    batch.defects = result["defects"]

    temp_readings = db.query(models.BatchEvent).filter(
        models.BatchEvent.batch_id == batch.id,
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
    db.refresh(batch)

    return {
        "batch_id": batch.id,
        "batch_identifier": batch.batch_id,
        "quality_index": batch.quality_index,
        "ripeness": batch.ripeness,
        "defects": batch.defects,
        "remaining_life_days": batch.remaining_life_days,
        "analysis_details": result.get("details", "Mock analysis")
    }