"""
Input Parser Service
Classifies and normalizes user travel input before sending to the LLM.
For URL inputs, fetches and extracts content to give the LLM real context.
"""
import re
import logging
from typing import Optional
from enum import Enum

logger = logging.getLogger(__name__)


class InputType(str, Enum):
    url = "url"
    location = "location"
    place = "place"
    free_text = "free_text"


URL_PATTERNS = [
    r"https?://(?:www\.)?instagram\.com/",
    r"https?://(?:www\.)?youtube\.com/",
    r"https?://(?:www\.)?youtu\.be/",
    r"https?://maps\.google\.com/",
    r"https?://(?:www\.)?google\.com/maps/",
    r"https?://goo\.gl/maps/",
    r"https?://",
]


def classify_input(text: str) -> InputType:
    text = text.strip()

    for pattern in URL_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return InputType.url

    if len(text) < 80 and "," in text:
        return InputType.location

    word_count = len(text.split())
    if word_count <= 4 and not any(
        kw in text.lower() for kw in ["i want", "i'd like", "plan", "days", "week"]
    ):
        return InputType.place

    return InputType.free_text


def get_source_label(input_type: InputType, text: str) -> str:
    if input_type == InputType.url:
        t = text.lower()
        if "instagram" in t:
            return "Instagram Reel"
        elif "youtube" in t or "youtu.be" in t:
            return "YouTube Video"
        elif "maps.google" in t or "google.com/maps" in t or "goo.gl/maps" in t or "maps.app.goo.gl" in t:
            return "Google Maps Location"
        return "Web Link"
    elif input_type == InputType.location:
        return "Location"
    elif input_type == InputType.place:
        return "Place"
    return "Travel Idea"


def build_input_context(
    travel_input: str,
    additional_places: Optional[list] = None,
) -> dict:
    """
    Classify and enrich the raw input before passing to the LLM.
    For URLs, attempts to fetch and extract actual content.
    For Instagram reels, extracts accompanying captions, hashtags, and destination tags.
    """
    input_type = classify_input(travel_input)
    source_label = get_source_label(input_type, travel_input)

    context: dict = {
        "raw_input": travel_input,
        "input_type": input_type.value,
        "source_label": source_label,
        "additional_places": additional_places or [],
        "extracted_content": None,
        "extraction_note": None,
    }

    if input_type == InputType.url:
        m_url = re.search(r'(https?://\S+)', travel_input)
        raw_url = m_url.group(1) if m_url else travel_input
        accompanying_text = re.sub(r'https?://\S+', '', travel_input).strip()

        # Instagram-specific smart extraction
        if "instagram.com" in raw_url.lower():
            if accompanying_text:
                context["extracted_content"] = (
                    f"Instagram Reel: {raw_url}\n"
                    f"User Reel Context & Highlights: {accompanying_text}"
                )
                context["extraction_note"] = "Extracted user destination & highlights for Instagram reel"
                return context
            else:
                # Try fetching via url_extractor
                try:
                    from app.services.url_extractor import fetch_url_content
                    result = fetch_url_content(raw_url)
                    if result["success"] and result.get("extracted_text"):
                        context["extracted_content"] = result["extracted_text"]
                        context["extraction_note"] = result.get("note")
                    else:
                        context["extracted_content"] = (
                            f"Instagram Reel: {raw_url}. Plan based on the destination "
                            "and any additional places selected by the user."
                        )
                        context["extraction_note"] = "Instagram reel link provided"
                except Exception as e:
                    logger.warning(f"Instagram extraction fallback: {e}")
                    context["extracted_content"] = f"Instagram Reel: {raw_url}"
                return context

        # YouTube, Google Maps and other web URLs
        try:
            from app.services.url_extractor import fetch_url_content
            result = fetch_url_content(raw_url)
            if result["success"] and result.get("extracted_text"):
                text = result["extracted_text"]
                if accompanying_text:
                    text = f"{text}\nUser Notes: {accompanying_text}"
                context["extracted_content"] = text
                context["extraction_note"] = result.get("note")
                if result.get("destination"):
                    context["destination"] = result["destination"]
                if result.get("stops"):
                    existing = set(context.get("additional_places", []))
                    for stop in result["stops"]:
                        if stop not in existing:
                            context["additional_places"].append(stop)
                            existing.add(stop)
                logger.info(f"URL content extracted: {text[:80]}...")
            else:
                if accompanying_text:
                    context["extracted_content"] = f"URL: {raw_url}\nUser Notes: {accompanying_text}"
                    context["extraction_note"] = "Used user notes for URL"
                else:
                    context["extraction_note"] = result.get("note", "Could not extract content")
                    logger.info(f"URL extraction skipped: {context['extraction_note']}")
        except Exception as e:
            logger.warning(f"URL extraction failed: {e}")
            context["extraction_note"] = "URL content could not be fetched"

    return context
