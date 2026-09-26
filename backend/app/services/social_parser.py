"""
Social Parser Service
Intelligently parses Instagram Reels, captions, and travel posts
using Gemini with rock-solid regex fallbacks.
"""
import re
import json
import logging
from typing import Optional, List
from google import genai
from google.genai import types

from app.config import settings
from app.schemas.trip import ParseReelResponse, TravelStyle

logger = logging.getLogger(__name__)

VALID_STYLES = {s.value for s in TravelStyle}

REEL_PROMPT_TEMPLATE = """You are an expert AI travel planner for Atlas.
Analyze this Instagram Reel travel post, caption, hashtags, and any provided notes.
Extract the structured travel itinerary details.

Reel URL: {url}
Caption / Notes:
{caption}

Return ONLY a valid JSON object with EXACTLY this structure (no markdown fences, no extra text):
{{
  "destination": "City or Region, Country (e.g. Bali, Indonesia)",
  "suggested_duration": 5,
  "must_visit_stops": ["Place 1", "Place 2", "Place 3"],
  "suggested_styles": ["culture", "relaxed"],
  "trip_summary": "1-2 sentence engaging summary of the trip featured in this reel"
}}

Guidelines:
- "destination": Identify the primary city/region and country. If unclear, infer from hashtags or landmarks.
- "suggested_duration": Suggest realistic days (typically 3 to 7) based on the places mentioned.
- "must_visit_stops": List specific landmarks, temples, cafes, beaches, or attractions mentioned in the caption/hashtags.
- "suggested_styles": Select 1 to 3 styles ONLY from this list: relaxed, adventure, budget, luxury, backpacking, romantic, family, party, culture.
- "trip_summary": Concise description of the trip highlights.
"""


def _heuristic_fallback(url: Optional[str], caption: str) -> ParseReelResponse:
    """Fast regex and keyword fallback if Gemini is unreachable."""
    text = (caption or "") + " " + (url or "")
    lines = (caption or "").split("\n")
    stops: List[str] = []

    # 1. Extract numbered/bulleted lines
    for line in lines:
        m = re.match(r"^(?:[0-9]+[.)]\s*|[-•*]\s*)(.+)$", line.strip())
        if m:
            spot = re.sub(r"#\S+", "", m.group(1)).strip()
            if 2 < len(spot) < 60:
                stops.append(spot)

    # 2. Extract meaningful hashtags
    ignored = {
        "reels", "viral", "fyp", "travel", "wanderlust", "explore", "vacation",
        "trip", "instatravel", "reelsinstagram", "trending", "instagood",
        "photooftheday", "adventure", "beautiful", "nature", "holiday", "reel",
    }
    tags = re.findall(r"#([a-zA-Z0-9_]+)", text)
    extracted_tags = []
    destination = "Featured Destination"

    for tag in tags:
        clean = tag.replace("_", " ").strip()
        low = clean.lower()
        if low not in ignored and len(clean) >= 3:
            title = clean.title()
            if destination == "Featured Destination" and len(clean) <= 25:
                destination = title
            elif title not in stops and len(title) <= 40:
                stops.append(title)

    # If destination still not detected, try common patterns
    if destination == "Featured Destination":
        m_dest = re.search(r"\b(?:in|to|visit|explore|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)", caption)
        if m_dest:
            destination = m_dest.group(1)
        elif "bali" in text.lower():
            destination = "Bali, Indonesia"
        elif "tokyo" in text.lower() or "japan" in text.lower():
            destination = "Tokyo, Japan"
        elif "paris" in text.lower() or "france" in text.lower():
            destination = "Paris, France"
        elif "amalfi" in text.lower() or "italy" in text.lower():
            destination = "Amalfi Coast, Italy"

    # Infer styles from keywords
    styles: List[str] = []
    low_text = text.lower()
    if any(k in low_text for k in ["beach", "sea", "ocean", "sunset", "relax", "chill"]):
        styles.append("relaxed")
    if any(k in low_text for k in ["temple", "museum", "history", "culture", "heritage", "palace"]):
        styles.append("culture")
    if any(k in low_text for k in ["hike", "trek", "cliff", "waterfall", "adventure", "surf"]):
        styles.append("adventure")
    if any(k in low_text for k in ["resort", "luxury", "villa", "suite", "fine dining"]):
        styles.append("luxury")
    if not styles:
        styles = ["relaxed", "culture"]

    return ParseReelResponse(
        success=True,
        destination=destination,
        suggested_duration=max(3, min(len(stops) + 1, 6)),
        must_visit_stops=stops[:8],
        suggested_styles=styles[:3],
        trip_summary=f"Curated journey to {destination} featuring highlighted spots from social reel.",
        reel_url=url,
    )


async def parse_instagram_reel(
    url: Optional[str] = None,
    caption_or_notes: Optional[str] = None,
) -> ParseReelResponse:
    """
    Analyzes an Instagram Reel URL and user caption/notes.
    Uses Gemini flash lite for extraction with instantaneous fallback.
    """
    clean_url = (url or "").strip()
    clean_caption = (caption_or_notes or "").strip()

    if not clean_url and not clean_caption:
        return ParseReelResponse(
            success=False,
            destination="Unknown",
            error="Please provide an Instagram reel link or paste its caption.",
        )

    # If Gemini is configured, use it for extraction
    if settings.api_key:
        try:
            client = genai.Client(api_key=settings.api_key)
            prompt = REEL_PROMPT_TEMPLATE.format(
                url=clean_url or "None provided",
                caption=clean_caption or "None provided (infer from URL if possible)",
            )

            # Try primary model first, fallback to lite if needed
            model_to_use = getattr(settings, "gemini_model", "gemini-3.1-flash-lite")
            if "3.8" in model_to_use or "3.7" in model_to_use:
                model_to_use = "gemini-3.1-flash-lite"

            response = client.models.generate_content(
                model=model_to_use,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )

            raw_text = response.text.strip()
            # Clean possible markdown wrapping
            if raw_text.startswith("```"):
                raw_text = re.sub(r"^```(?:json)?\n?", "", raw_text)
                raw_text = re.sub(r"\n?```$", "", raw_text)

            data = json.loads(raw_text)

            dest = data.get("destination", "Featured Destination")
            raw_duration = data.get("suggested_duration", 5)
            try:
                if isinstance(raw_duration, str):
                    m_num = re.search(r"\d+", raw_duration)
                    duration = int(m_num.group(0)) if m_num else 5
                else:
                    duration = int(raw_duration)
                duration = max(2, min(duration, 14))
            except Exception:
                duration = 5

            stops = [s.strip() for s in data.get("must_visit_stops", []) if isinstance(s, str) and s.strip()]
            
            # Map & validate styles
            raw_styles = data.get("suggested_styles", [])
            valid_extracted_styles = []
            for s in raw_styles:
                s_clean = s.lower().replace(" ", "_")
                if s_clean in VALID_STYLES and s_clean not in valid_extracted_styles:
                    valid_extracted_styles.append(s_clean)
                # Map loose words
                elif "beach" in s_clean or "relax" in s_clean:
                    if "relaxed" not in valid_extracted_styles:
                        valid_extracted_styles.append("relaxed")
                elif "cultur" in s_clean or "sightsee" in s_clean:
                    if "culture" not in valid_extracted_styles:
                        valid_extracted_styles.append("culture")
                elif "adventur" in s_clean or "nature" in s_clean:
                    if "adventure" not in valid_extracted_styles:
                        valid_extracted_styles.append("adventure")

            if not valid_extracted_styles:
                valid_extracted_styles = ["relaxed", "culture"]

            summary = data.get("trip_summary") or f"Customized trip to {dest} inspired by your Instagram reel."

            return ParseReelResponse(
                success=True,
                destination=dest,
                suggested_duration=duration,
                must_visit_stops=stops[:10],
                suggested_styles=valid_extracted_styles[:3],
                trip_summary=summary,
                reel_url=clean_url,
            )

        except Exception as e:
            logger.warning(f"Gemini reel parsing failed ({e}), using heuristic fallback")

    # Fallback to heuristic parser
    return _heuristic_fallback(clean_url, clean_caption)
