import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware   # <-- Moved to top with other imports

from .database import engine, Base
from . import models
from .routers.crops import router as crops_router
from .routers.markets import router as markets_router
from .routers.transport import router as transport_router
from .routers.batches import router as batches_router
from .routers.events import router as events_router
from .routers.quality import router as quality_router
from .routers.risk import router as risk_router
from .routers.safety import router as safety_router
from .routers.demand import router as demand_router
from .routers.decisions import router as decisions_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FreshOS API",
    version="0.1.0"
)

# ✅ CORS Middleware — Next.js (localhost:3000) ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(crops_router)
app.include_router(markets_router)
app.include_router(transport_router)
app.include_router(batches_router)
app.include_router(events_router)
app.include_router(quality_router)
app.include_router(risk_router)
app.include_router(safety_router)
app.include_router(demand_router)
app.include_router(decisions_router)

@app.get("/")
def root():
    return {
        "status": "running",
        "message": "FreshOS backend is working"
    }