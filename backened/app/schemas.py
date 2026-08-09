from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class CropBase(BaseModel):
    farmer_name: str
    location: str
    commodity: str
    variety: str
    quantity_kg: float
    maturity_stage: str

class CropCreate(CropBase):
    pass

class CropResponse(CropBase):
    id: int
    harvest_window_start: Optional[datetime] = None
    harvest_window_end: Optional[datetime] = None
    weather_risk: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Batch Schemas ---

class BatchBase(BaseModel):
    crop_id: int
    quantity_kg: float
    origin: str
    destination: str

class BatchCreate(BatchBase):
    pass

class BatchResponse(BatchBase):
    id: int
    batch_id: str
    harvest_time: datetime
    current_location: str
    quality_index: float
    ripeness: str
    defects: str
    remaining_life_days: float
    status: str
    qr_code_base64: Optional[str] = None
    crop: Optional[CropResponse] = None   # optional, for detailed view

    model_config = ConfigDict(from_attributes=True)    


# --- Event Schemas ---

class EventBase(BaseModel):
    batch_id: int
    event_type: str
    temperature_c: Optional[float] = None
    location: Optional[str] = None
    description: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)    