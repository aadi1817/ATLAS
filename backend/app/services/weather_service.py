"""
Weather Service
Fetches real forecast data from Open-Meteo (free, no API key needed).
Geocodes destination using Open-Meteo's geocoding API.
Returns a per-day weather summary for the trip dates.
"""
import logging
from datetime import date, timedelta
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
TIMEOUT = 8  # seconds — fast enough to not block


# ── WMO weather code descriptions ─────────────────────────────────────────────
WMO_CODES: dict[int, tuple[str, str]] = {
    0:  ("Clear sky", "sunny"),
    1:  ("Mainly clear", "sunny"),
    2:  ("Partly cloudy", "cloudy"),
    3:  ("Overcast", "cloudy"),
    45: ("Foggy", "foggy"),
    48: ("Icy fog", "foggy"),
    51: ("Light drizzle", "rainy"),
    53: ("Moderate drizzle", "rainy"),
    55: ("Dense drizzle", "rainy"),
    61: ("Slight rain", "rainy"),
    63: ("Moderate rain", "rainy"),
    65: ("Heavy rain", "rainy"),
    71: ("Slight snow", "snowy"),
    73: ("Moderate snow", "snowy"),
    75: ("Heavy snow", "snowy"),
    77: ("Snow grains", "snowy"),
    80: ("Slight showers", "rainy"),
    81: ("Moderate showers", "rainy"),
    82: ("Violent showers", "rainy"),
    85: ("Snow showers", "snowy"),
    86: ("Heavy snow showers", "snowy"),
    95: ("Thunderstorm", "stormy"),
    96: ("Thunderstorm with hail", "stormy"),
    99: ("Heavy thunderstorm", "stormy"),
}

CONDITION_ADVICE: dict[str, str] = {
    "sunny":  "Great weather for outdoor activities.",
    "cloudy": "Mild weather, comfortable for sightseeing.",
    "foggy":  "Limited visibility — avoid scenic viewpoints. Good for indoor cultural sites.",
    "rainy":  "Rain expected — prioritise indoor activities (museums, restaurants, cafes). Carry an umbrella.",
    "snowy":  "Snow expected — outdoor activities may be limited. Consider indoor attractions.",
    "stormy": "Storms expected — avoid outdoor and water activities entirely. Stay indoors.",
}

OUTDOOR_TYPES = {"beach", "nature", "adventure", "photography", "activity"}
INDOOR_TYPES  = {"food", "culture", "shopping", "accommodation"}


def _wmo_to_condition(code: int) -> tuple[str, str]:
    """Return (description, condition_key) for a WMO weather code."""
    return WMO_CODES.get(code, ("Unknown conditions", "cloudy"))


async def geocode_destination(destination: str) -> Optional[tuple[float, float, str]]:
    """
    Returns (latitude, longitude, resolved_name) for a destination string.
    Uses Open-Meteo Geocoding API — no key required.
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(GEOCODE_URL, params={"name": destination, "count": 1, "language": "en"})
            r.raise_for_status()
            data = r.json()
            results = data.get("results", [])
            if not results:
                return None
            place = results[0]
            return (
                float(place["latitude"]),
                float(place["longitude"]),
                place.get("name", destination),
            )
    except Exception as e:
        logger.warning(f"Geocoding failed for '{destination}': {e}")
        return None


async def fetch_weather_forecast(
    destination: str,
    start_date: date,
    duration_days: int,
) -> Optional[list[dict]]:
    """
    Fetch daily weather forecast for the trip dates.
    Returns a list of per-day dicts, one per trip day:
      {
        "day": 1,
        "date": "2025-03-15",
        "description": "Moderate rain",
        "condition": "rainy",           # sunny / cloudy / rainy / snowy / stormy / foggy
        "advice": "Rain expected...",
        "temp_max_c": 28,
        "temp_min_c": 22,
        "precipitation_mm": 12.4,
        "is_bad_weather": True,
        "avoid_outdoor": True,
      }
    Returns None if forecast is unavailable (graceful degradation).
    """
    geo = await geocode_destination(destination)
    if not geo:
        logger.warning(f"Could not geocode '{destination}' — skipping weather")
        return None

    lat, lon, resolved = geo
    end_date = start_date + timedelta(days=duration_days - 1)

    # Open-Meteo only provides forecasts up to 16 days ahead
    today = date.today()
    max_forecast_date = today + timedelta(days=16)
    if start_date > max_forecast_date:
        logger.info(f"Trip dates beyond 16-day forecast window — skipping weather")
        return None

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(FORECAST_URL, params={
                "latitude": lat,
                "longitude": lon,
                "daily": "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum",
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "timezone": "auto",
            })
            r.raise_for_status()
            data = r.json()

        daily = data.get("daily", {})
        dates      = daily.get("time", [])
        codes      = daily.get("weathercode", [])
        temp_max   = daily.get("temperature_2m_max", [])
        temp_min   = daily.get("temperature_2m_min", [])
        precip     = daily.get("precipitation_sum", [])

        if not dates:
            return None

        result = []
        for i, d in enumerate(dates):
            code = int(codes[i]) if i < len(codes) else 0
            description, condition = _wmo_to_condition(code)
            p = float(precip[i]) if i < len(precip) else 0.0
            tmax = round(float(temp_max[i])) if i < len(temp_max) else None
            tmin = round(float(temp_min[i])) if i < len(temp_min) else None

            is_bad = condition in ("rainy", "stormy", "snowy")
            result.append({
                "day": i + 1,
                "date": d,
                "description": description,
                "condition": condition,
                "advice": CONDITION_ADVICE.get(condition, ""),
                "temp_max_c": tmax,
                "temp_min_c": tmin,
                "precipitation_mm": p,
                "is_bad_weather": is_bad,
                "avoid_outdoor": condition in ("rainy", "stormy"),
            })

        logger.info(f"Weather fetched successfully: {[r['condition'] for r in result]}")
        return result

    except Exception as e:
        logger.warning(f"Weather fetch failed: {e}")
        return None


def format_weather_for_prompt(weather: list[dict]) -> str:
    """Format weather data as a concise block for the LLM prompt."""
    lines = ["WEATHER FORECAST (adjust activities accordingly):"]
    for w in weather:
        temp_str = ""
        if w["temp_max_c"] is not None:
            temp_str = f", {w['temp_min_c']}–{w['temp_max_c']}°C"
        outdoor_note = " ⚠️ AVOID outdoor activities — prioritise indoor alternatives." if w["avoid_outdoor"] else ""
        lines.append(
            f"  Day {w['day']} ({w['date']}): {w['description']}{temp_str}.{outdoor_note}"
        )
    lines.append(
        "IMPORTANT: For days marked with ⚠️, replace beach/outdoor/adventure activities "
        "with indoor alternatives like museums, cafes, spas, cooking classes, or shopping."
    )
    return "\n".join(lines)
