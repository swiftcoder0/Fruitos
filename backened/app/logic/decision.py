from .economics import compute_economics
from .safety import check_storage_safety
from .risk import detect_waste_risk
from .market import evaluate_markets
from .demand import get_expected_demand
from .. import models  # for BatchEvent query

def get_latest_temp_c(batch, db) -> float:
    """Return the most recent logged temperature for this batch."""
    latest = (
        db.query(models.BatchEvent)
        .filter(
            models.BatchEvent.batch_id == batch.id,
            models.BatchEvent.event_type == "temperature"
        )
        .order_by(models.BatchEvent.timestamp.desc())
        .first()
    )
    return latest.temperature_c if latest else 25.0  # fallback ambient temp

def evaluate_actions(batch, crop, db):
    """
    Core decision engine:
      - Compute risk and demand.
      - Evaluate economics for all actions.
      - Apply safety gates per action using actual current temperature.
      - Inject a demo 'coldstore_x' candidate to show rejection.
    """
    # 1. Demand and risk
    expected_demand = get_expected_demand(
        commodity=crop.commodity,
        variety=crop.variety,
        location=batch.current_location
    )
    risk_info = detect_waste_risk(batch.quantity_kg, expected_demand)

    # 2. Market options (for transfer)
    markets = evaluate_markets(batch.quantity_kg)

    # 3. Economics (pass remaining_life_days)
    econ_results = compute_economics(
        batch, crop, markets, risk_info,
        remaining_life_days=batch.remaining_life_days
    )

    # 4. Safety: get actual current temperature
    current_temp = get_latest_temp_c(batch, db)
    current_safety = check_storage_safety(crop.commodity, current_temp)

    # --- Gate HOLD / MARKDOWN actions against the actual current temp ---
    for action in ["hold", "markdown10", "markdown25"]:
        if not current_safety["is_safe"]:
            econ_results[action]["feasible"] = False
            econ_results[action]["reason"] = (
                f"❌ Rejected: current storage at {current_temp}°C is unsafe for {crop.commodity}."
            )

    # --- DEMO: inject an unsafe cold‑storage candidate to highlight safety gate ---
    coldstore_x_temp = 5.0  # °C – unsafe for mango
    coldstore_safety = check_storage_safety(crop.commodity, coldstore_x_temp)
    econ_results["coldstore_x"] = {
        "net_value": round(batch.quantity_kg * 50.0 * 1.05, 2),  # looks best on paper
        "waste_kg": 0.0,
        "feasible": coldstore_safety["is_safe"],
        "reason": coldstore_safety["reason"] if not coldstore_safety["is_safe"]
                  else "Cold Store X – looks best on paper.",
    }

    # 5. Return everything (router will pick the best feasible)
    return econ_results, risk_info, markets, current_safety