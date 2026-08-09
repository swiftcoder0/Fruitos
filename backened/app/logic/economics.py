def compute_economics(batch, crop, markets, risk_info, remaining_life_days=None):
    """
    Compute net value for each action.
    Urgency factor = min(1.0, remaining_life_days / reference_days)
    - reference_days = 3.0 (assumption: beyond 3 days, no urgency discount)
    """
    quantity = batch.quantity_kg
    price_per_kg = 50.0  # Assumption: base price ₹50/kg

    expected_demand = risk_info.get("expected_demand_kg", quantity * 0.6)

    # --- Urgency factor based on remaining life ---
    reference_days = 3.0  # TODO: make commodity‑specific later
    if remaining_life_days is not None:
        urgency_factor = min(1.0, remaining_life_days / reference_days)
    else:
        urgency_factor = 1.0  # no data → no penalty

    results = {}

    # --- HOLD ---
    local_demand = expected_demand * urgency_factor
    sold = min(quantity, local_demand)
    waste = quantity - sold
    revenue = sold * price_per_kg
    net = revenue - (waste * 5.0)
    results["hold"] = {
        "net_value": round(net, 2),
        "waste_kg": round(waste, 1),
        "feasible": True,
        "reason": f"Normal selling; urgency factor {urgency_factor:.2f} ({remaining_life_days} days left).",
    }

    # --- MARKDOWN 10% ---
    local_demand = expected_demand * 1.2 * urgency_factor
    sold = min(quantity, local_demand)
    waste = quantity - sold
    revenue = sold * (price_per_kg * 0.9)
    net = revenue - (waste * 5.0)
    results["markdown10"] = {
        "net_value": round(net, 2),
        "waste_kg": round(waste, 1),
        "feasible": True,
        "reason": "10% price cut, +20% demand, urgency‑adjusted.",
    }

    # --- MARKDOWN 25% ---
    local_demand = expected_demand * 1.5 * urgency_factor
    sold = min(quantity, local_demand)
    waste = quantity - sold
    revenue = sold * (price_per_kg * 0.75)
    net = revenue - (waste * 5.0)
    results["markdown25"] = {
        "net_value": round(net, 2),
        "waste_kg": round(waste, 1),
        "feasible": True,
        "reason": "25% price cut, +50% demand, urgency‑adjusted.",
    }

    # --- TRANSFER --- (not urgency‑scaled; destination market provides its own net)
    if markets:
        best_market = markets[0]
        results["transfer"] = {
            "net_value": round(best_market["net_value"], 2),
            "waste_kg": 0.0,
            "feasible": True,
            "reason": f"Transfer to {best_market['market']} – best net after transport & spoilage.",
        }
    else:
        results["transfer"] = {
            "net_value": 0,
            "waste_kg": quantity,
            "feasible": False,
            "reason": "No viable destination markets.",
        }

    # --- RESCUE --- (always available, low value, zero waste)
    results["rescue"] = {
        "net_value": round(quantity * price_per_kg * 0.3, 2),
        "waste_kg": 0.0,
        "feasible": True,
        "reason": "Send to processing (juice/pulp) – low price but zero waste.",
    }

    return results