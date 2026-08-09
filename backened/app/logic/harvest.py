import os
import requests
from datetime import datetime, timedelta
from .. import models

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")   # <-- put your key in backened/.env
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"


def get_weather_risk(location: str) -> str:
    """
    Real weather check for `location`. Returns a plain informational flag —
    this must NEVER be framed as an AI-predicted harvest window, only as
    context shown alongside the farmer's own entered harvest date.
    Falls back safely if the key is missing or the call fails — weather
    must never be load-bearing for the core demo, same rule as Gemini.
    """
    if not WEATHER_API_KEY:
        return "Weather data unavailable — set WEATHER_API_KEY to enable."

    try:
        response = requests.get(
            WEATHER_API_URL,
            params={"q": f"{location},IN", "appid": WEATHER_API_KEY, "units": "metric"},
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()

        rain_expected = "rain" in data
        temp_c = data["main"]["temp"]
        description = data["weather"][0]["description"]

        if rain_expected:
            return f"Rain expected in {location} — plan harvest before it arrives. Currently {temp_c}°C, {description}."
        return f"No rain expected in {location} right now. Currently {temp_c}°C, {description}."

    except Exception as e:
        return f"Weather check failed ({e}) — proceed using your own judgement."


def suggest_harvest_window(crop: models.Crop):
    """
    Harvest window = farmer's own maturity stage + simple rules, NOT weather.
    Weather is shown alongside as a plain flag only (get_weather_risk).
    """
    today = datetime.now()

    if crop.maturity_stage.lower() == "approaching harvest":
        window_start = today + timedelta(days=2)
        window_end = today + timedelta(days=4)
    elif crop.maturity_stage.lower() == "ready":
        window_start = today
        window_end = today + timedelta(days=1)
    elif crop.maturity_stage.lower() == "overripe":
        window_start = today
        window_end = today + timedelta(days=1)
    else:
        window_start = today + timedelta(days=3)
        window_end = today + timedelta(days=5)

    return {
        "window_start": window_start,
        "window_end": window_end,
        "weather_risk": get_weather_risk(crop.location),
    }