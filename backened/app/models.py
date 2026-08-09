from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    commodity = Column(String, nullable=False)
    variety = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    maturity_stage = Column(String, nullable=False)

    harvest_window_start = Column(DateTime, nullable=True)
    harvest_window_end = Column(DateTime, nullable=True)
    weather_risk = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    batches = relationship("Batch", back_populates="crop")


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, unique=True, index=True, nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)

    quantity_kg = Column(Float, nullable=False)
    origin = Column(String, nullable=False)
    current_location = Column(String, nullable=False)
    destination = Column(String, nullable=True)

    harvest_time = Column(DateTime, default=datetime.utcnow)

    quality_index = Column(Float, default=0.8)
    ripeness = Column(String, default="Medium")
    defects = Column(String, default="Low")

    remaining_life_days = Column(Float, default=7.0)

    status = Column(String, default="healthy")

    qr_code_base64 = Column(Text, nullable=True)

    crop = relationship("Crop", back_populates="batches")
    events = relationship("BatchEvent", back_populates="batch", cascade="all, delete-orphan")


class BatchEvent(Base):
    __tablename__ = "batch_events"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    event_type = Column(String, nullable=False)
    temperature_c = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="events")