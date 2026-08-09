from fastapi import APIRouter, HTTPException
from ..logic.market import evaluate_markets

router = APIRouter(
    prefix="/markets",
    tags=["markets"]
)

@router.get("/")
def get_markets(quantity_kg: float = 1000):
    """
    Get all markets with their expected net values.
    Pass quantity_kg to calculate transport and deterioration costs.
    """
    if quantity_kg <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
    
    results = evaluate_markets(quantity_kg)
    
    # Find the best market (first in sorted list)
    if results:
        best = results[0]
        return {
            "markets": results,
            "recommended": {
                "market": best["market"],
                "net_value": best["net_value"],
                "reason": f"Best expected net value after transport and deterioration costs"
            }
        }
    
    return {"markets": [], "recommended": None}