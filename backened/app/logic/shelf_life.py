import json
import os
from datetime import datetime
from typing import List, Dict

def load_commodity_params(commodity: str) -> dict:
    """Load commodity parameters from JSON file."""
    json_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "commodity_parameters.json")
    
    if not os.path.exists(json_path):
        # If file doesn't exist, return defaults
        return {
            "base_life_days": 7.0,
            "reference_temp_c": 13.0,
            "q10": 2.0,
            "min_safe_temp": 10,
            "max_safe_temp": 15,
            "quality_decay_factor": 0.15
        }
    
    with open(json_path, "r") as f:
        data = json.load(f)
    
    if commodity not in data:
        return data.get("Mango", {
            "base_life_days": 7.0,
            "reference_temp_c": 13.0,
            "q10": 2.0,
            "min_safe_temp": 10,
            "max_safe_temp": 15,
            "quality_decay_factor": 0.15
        })
    return data[commodity]

def calculate_remaining_life(
    commodity: str,
    quality_index: float,
    temperature_readings: List[Dict[str, float]]
) -> float:
    """Calculate remaining useful life using a Q10 model."""
    params = load_commodity_params(commodity)
    
    base_life_days = params.get("base_life_days", 7.0)
    reference_temp = params.get("reference_temp_c", 13.0)
    q10 = params.get("q10", 2.0)
    quality_decay = params.get("quality_decay_factor", 0.15)
    
    if not temperature_readings:
        life = base_life_days * quality_index
        return round(max(0.5, life), 1)
    
    sorted_readings = sorted(temperature_readings, key=lambda x: x["timestamp"])
    total_degradation = 0.0
    prev_reading = None
    
    for reading in sorted_readings:
        temp = reading.get("temperature_c")
        if temp is None:
            continue
            
        factor = q10 ** ((temp - reference_temp) / 10.0)
        
        if prev_reading is None:
            hours = 2.0
        else:
            delta = reading["timestamp"] - prev_reading["timestamp"]
            hours = delta.total_seconds() / 3600.0
            hours = min(hours, 24.0)
        
        total_degradation += factor * (hours / 24.0)
        prev_reading = reading
    
    if sorted_readings:
        final_temp = sorted_readings[-1].get("temperature_c")
        if final_temp is not None:
            final_factor = q10 ** ((final_temp - reference_temp) / 10.0)
            total_degradation += final_factor * (4.0 / 24.0)
    
    remaining = base_life_days - total_degradation
    quality_multiplier = 0.5 + (quality_index * 0.5)
    remaining = remaining * quality_multiplier
    
    if quality_index < 0.7:
        remaining = remaining * (1 - quality_decay)
    
    remaining = max(0.5, min(remaining, base_life_days))
    return round(remaining, 1)