from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas
from ..logic.harvest import suggest_harvest_window   # <-- import harvest logic

router = APIRouter(
    prefix="/crops",
    tags=["crops"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.CropResponse)
def create_crop(crop: schemas.CropCreate, db: Session = Depends(get_db)):
    db_crop = models.Crop(**crop.model_dump())
    
    # 🌾 Harvest Intelligence
    harvest_info = suggest_harvest_window(db_crop)
    db_crop.harvest_window_start = harvest_info["window_start"]
    db_crop.harvest_window_end = harvest_info["window_end"]
    db_crop.weather_risk = harvest_info["weather_risk"]   # <-- ADD THIS
    
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop

@router.get("/{crop_id}", response_model=schemas.CropResponse)
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    db_crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not db_crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return db_crop