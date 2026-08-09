def detect_waste_risk(inventory_kg: float, expected_demand_kg: float) -> dict:
    """
    Detect waste risk based on inventory vs expected demand.
    
    Returns:
        - at_risk_kg: how much is at risk
        - risk_level: HIGH, MEDIUM, or LOW
        - message: human-readable summary
    """
    excess = max(0, inventory_kg - expected_demand_kg)
    
    if excess == 0:
        risk_level = "LOW"
        message = "Demand matches or exceeds inventory. No waste risk."
    elif excess > 0.3 * inventory_kg:
        risk_level = "HIGH"
        message = f"⚠️ {excess:.0f} kg at risk – demand is significantly lower than inventory."
    else:
        risk_level = "MEDIUM"
        message = f"⚡ {excess:.0f} kg at risk – inventory slightly exceeds demand."
    
    return {
        "inventory_kg": inventory_kg,
        "expected_demand_kg": expected_demand_kg,
        "at_risk_kg": round(excess, 1),
        "excess_percentage": round((excess / inventory_kg) * 100, 1) if inventory_kg > 0 else 0,
        "risk_level": risk_level,
        "message": message
    }