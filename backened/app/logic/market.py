import pandas as pd
import os

def get_candidate_markets():
    """Read market data from CSV file"""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "markets_mock.csv")
    df = pd.read_csv(csv_path)
    return df.to_dict(orient="records")

def estimate_transport_cost(quantity_kg, distance_km):
    """Simple transport cost: ₹5 per kg per 100 km"""
    return (quantity_kg * distance_km * 0.05)

def estimate_deterioration_loss(quantity_kg, travel_hours, price_per_kg):
    """
    Estimate loss during transport.
    If travel time > 4 hours, assume 10% loss.
    If travel time > 8 hours, assume 20% loss.
    """
    if travel_hours > 8:
        loss_pct = 0.20
    elif travel_hours > 4:
        loss_pct = 0.10
    else:
        loss_pct = 0.02  # minimal loss
    
    return quantity_kg * price_per_kg * loss_pct

def evaluate_markets(quantity_kg):
    """
    Evaluate all markets and return sorted by expected net value.
    """
    markets = get_candidate_markets()
    results = []
    
    for m in markets:
        price = m["price_per_kg"]
        distance = m["distance_km"]
        travel_hours = m["travel_hours"]
        
        # Calculate costs
        transport_cost = estimate_transport_cost(quantity_kg, distance)
        deterioration_loss = estimate_deterioration_loss(quantity_kg, travel_hours, price)
        
        # Gross revenue
        gross_revenue = quantity_kg * price
        
        # Net value
        net = gross_revenue - transport_cost - deterioration_loss
        
        results.append({
            "market": m["name"],
            "price_per_kg": price,
            "gross_revenue": round(gross_revenue, 2),
            "transport_cost": round(transport_cost, 2),
            "deterioration_loss": round(deterioration_loss, 2),
            "net_value": round(net, 2),
            "distance_km": distance,
            "travel_hours": travel_hours
        })
    
    # Sort by net_value descending (best first)
    return sorted(results, key=lambda x: -x["net_value"])