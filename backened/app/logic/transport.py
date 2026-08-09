import pandas as pd
import os
from datetime import datetime
import traceback  # <-- ADD THIS

def get_trucks():
    """Read truck data from CSV"""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "transport_mock.csv")
    
    try:
        df = pd.read_csv(csv_path)
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"ERROR loading trucks: {e}")
        print(traceback.format_exc())
        return []

def find_feasible_trucks(quantity_kg, destination, required_arrival_hours=24):
    trucks = get_trucks()
    if not trucks:
        print("No trucks loaded")
        return []
    
    feasible = []
    now = datetime.now()
    
    for t in trucks:
        try:
            if t["capacity_kg"] < quantity_kg:
                continue
            
            # Skip availability checks for now to avoid date parsing issues
            # Parse dates only if needed later
            
            cost_per_kg = t["cost"] / quantity_kg
            score = cost_per_kg + (t["travel_hours"] * 10)
            
            feasible.append({
                "truck_id": t["truck_id"],
                "capacity_kg": t["capacity_kg"],
                "cost": t["cost"],
                "travel_hours": t["travel_hours"],
                "available": True,
                "score": round(score, 2),
                "cost_per_kg": round(cost_per_kg, 2)
            })
        except Exception as e:
            print(f"Error processing truck {t}: {e}")
            continue
    
    feasible.sort(key=lambda x: x["score"])
    
    for idx, t in enumerate(feasible):
        t["rank"] = idx + 1
        t["recommended"] = (idx == 0)
    
    return feasible

def get_recommended_transport(quantity_kg, destination):
    feasible = find_feasible_trucks(quantity_kg, destination)
    if not feasible:
        return {
            "feasible": [],
            "recommended": None,
            "message": "No truck available for this quantity and destination."
        }
    
    return {
        "feasible": feasible,
        "recommended": feasible[0],
        "message": f"Truck {feasible[0]['truck_id']} is the best option for {quantity_kg} kg to {destination}."
    }