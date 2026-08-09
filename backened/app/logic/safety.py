import json
import os

def load_safety_params(commodity: str) -> dict:
    json_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "commodity_parameters.json")
    defaults = {"min_safe_temp": 13, "max_safe_temp": 30}

    if not os.path.exists(json_path):
        return defaults

    with open(json_path, "r") as f:
        data = json.load(f)

    # case-insensitive match, always returns the SAME key names either way
    match = next((v for k, v in data.items() if k.lower() == commodity.lower()), None)
    if match is None:
        match = data.get("Mango", {})

    return {
        "min_safe_temp": match.get("safe_temp_min", defaults["min_safe_temp"]),
        "max_safe_temp": match.get("safe_temp_max", defaults["max_safe_temp"]),
    } 
def check_storage_safety(commodity: str, storage_temp: float) -> dict:
    """
    Check if a storage temperature is safe for a given commodity.
    Uses the WIDE 'safe' range (damage-avoidance).
    """
    params = load_safety_params(commodity)
    min_temp = params["min_safe_temp"]
    max_temp = params["max_safe_temp"]
    
    if min_temp <= storage_temp <= max_temp:
        return {
            "is_safe": True,
            "reason": f"✅ Temperature {storage_temp}°C is safe – damage range is {min_temp}–{max_temp}°C",
            "min_safe_temp": min_temp,
            "max_safe_temp": max_temp,
            "storage_temp": storage_temp
        }
    else:
        return {
            "is_safe": False,
            "reason": f"❌ Temperature {storage_temp}°C is UNSAFE – damage occurs outside {min_temp}–{max_temp}°C",
            "min_safe_temp": min_temp,
            "max_safe_temp": max_temp,
            "storage_temp": storage_temp
        }