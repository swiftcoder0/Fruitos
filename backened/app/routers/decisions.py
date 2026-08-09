from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from ..logic.decision import evaluate_actions
from ..logic.explanation import gemini_explanation

router = APIRouter(
    prefix="/decisions",
    tags=["decisions"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{batch_id}")
def get_decision(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    crop = db.query(models.Crop).filter(models.Crop.id == batch.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    econ_results, risk_info, markets, current_safety = evaluate_actions(batch, crop, db)

    feasible_actions = {k: v for k, v in econ_results.items() if v.get("feasible", False)}
    if feasible_actions:
        best_action = max(feasible_actions, key=lambda k: feasible_actions[k]["net_value"])
        recommendation = {
            "action": best_action,
            "net_value": feasible_actions[best_action]["net_value"],
            "waste_kg": feasible_actions[best_action]["waste_kg"],
            "reason": econ_results[best_action].get("reason", "")
        }
    else:
        recommendation = None

    # Build the response dict
    result = {
        "batch_id": batch.id,
        "batch_identifier": batch.batch_id,
        "commodity": crop.commodity,          # frontend theming needs this
        "variety": crop.variety,
        "location": batch.current_location,
        "quality_index": batch.quality_index,
        "remaining_life_days": batch.remaining_life_days,
        "risk": risk_info,
        "current_temperature": current_safety.get("storage_temp") if current_safety else None,
        "safety_check": current_safety,
        "actions": econ_results,
        "recommendation": recommendation,
    }

    # --- Generate explanation (Gemini if available, otherwise template) ---
    result["explanation"] = gemini_explanation(result)

    return result