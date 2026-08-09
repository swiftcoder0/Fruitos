from fastapi import APIRouter, HTTPException
from ..logic.transport import get_recommended_transport

router = APIRouter(
    prefix="/transport",
    tags=["transport"]
)

@router.get("/options")
def get_transport_options(
    quantity_kg: float,
    destination: str,
    required_arrival_hours: int = 24
):
    """
    Get transport options for a batch.
    Returns feasible trucks and the best recommendation.
    """
    if quantity_kg <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
    
    if not destination:
        raise HTTPException(status_code=400, detail="Destination is required")
    
    result = get_recommended_transport(quantity_kg, destination)
    
    return result