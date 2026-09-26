"""
URL Content Extractor
Fetches publicly accessible travel content from URLs and extracts useful text
that the LLM can use to infer destination, places, and activities.

What works:
  - Instagram reels/posts  → fetches Open Graph meta tags (title, description, location)
  - YouTube videos         → fetches Open Graph + description
  - Google Maps links      → extracts place name from URL path
  - Generic travel blogs   → fetches page title + meta description

What doesn't work (by design, not a bug):
  - Private/login-gated Instagram accounts  → graceful fallback
  - YouTube Shorts with no description      → graceful fallback
  - Scraping full page content              → we only use meta tags (fast, lightweight)
"""
import re
import logging
from typing import Optional
from urllib.parse import urlparse, unquote

import httpx

logger = logging.getLogger(__name__)

FETCH_TIMEOUT = 10  # seconds
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


# ── Meta tag extraction ────────────────────────────────────────────────────────

def _extract_meta(html: str, property_name: str) -> Optional[str]:
    """Extract a single Open Graph / meta tag value from raw HTML."""
    patterns = [
        rf'<meta[^>]+property=["\']og:{property_name}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:{property_name}["\']',
        rf'<meta[^>]+name=["\']{property_name}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']{property_name}["\']',
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE | re.DOTALL)
        if m:
            val = m.group(1).strip()
            if val:
                return val
    return None


def _extract_title(html: str) -> Optional[str]:
    m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    return m.group(1).strip() if m else None


def _clean_text(text: str) -> str:
    """Remove HTML entities and collapse whitespace."""
    text = re.sub(r"&#\d+;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"&quot;", '"', text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ── Platform-specific extractors ───────────────────────────────────────────────

def _extract_instagram(url: str, html: str) -> dict:
    """
    Try Instagram oEmbed first (works for public posts, no token needed).
    Falls back to og tags, then gracefully fails with a helpful note.
    """
    # Instagram oEmbed — works for public posts without auth
    try:
        with httpx.Client(headers=HEADERS, timeout=FETCH_TIMEOUT) as client:
            r = client.get(f"https://api.instagram.com/oembed/?url={url}&maxwidth=320&omitscript=true")
            if r.status_code == 200:
                data = r.json()
                title = data.get("title", "")
                author = data.get("author_name", "")
                if title:
                    text = f"Instagram post by {author}: '{title}'. Use this to identify the travel destination."
                    return {
                        "platform": "instagram",
                        "extracted_text": text,
                        "note": f"Caption extracted via Instagram oEmbed",
                    }
    except Exception:
        pass

    # Try og tags from HTML
    title = _extract_meta(html, "title") or _extract_title(html) or ""
    description = _extract_meta(html, "description") or ""

    caption = re.sub(r'^.*? on Instagram:\s*["\']?', "", title, flags=re.IGNORECASE)
    caption = caption.rstrip('"\'')
    combined = f"{caption} {description}".strip()
    combined = _clean_text(combined)

    if len(combined) > 20:
        return {
            "platform": "instagram",
            "extracted_text": combined[:1200],
            "note": "Caption extracted from Instagram post",
        }

    # Instagram blocked us entirely
    return {
        "platform": "instagram",
        "extracted_text": "",
        "note": (
            "Instagram requires login to view this content. "
            "For best results, copy the caption/location from the reel and paste it directly into Atlas."
        ),
    }


def _extract_youtube(url: str, html: str) -> dict:
    """
    Try YouTube oEmbed API first (gives real title + author).
    Fall back to og tags from HTML.
    """
    try:
        oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
        with httpx.Client(headers=HEADERS, timeout=FETCH_TIMEOUT) as client:
            r = client.get(oembed_url)
            if r.status_code == 200:
                data = r.json()
                title = data.get("title", "")
                author = data.get("author_name", "")
                text = f"YouTube video titled: '{title}' by {author}. Use the video title to infer the travel destination and content."
                return {
                    "platform": "youtube",
                    "extracted_text": text,
                    "note": f"Video title extracted via YouTube oEmbed: '{title}'",
                }
    except Exception:
        pass

    # Fall back to og tags
    title = _extract_meta(html, "title") or _extract_title(html) or ""
    description = _extract_meta(html, "description") or ""
    combined = f"YouTube video: {title}. {description}"
    return {
        "platform": "youtube",
        "extracted_text": _clean_text(combined)[:1000],
        "note": "Video title extracted from YouTube page",
    }


def _parse_maps_target(target_url: str) -> Optional[dict]:
    """Parse place, search query, directions or coordinates from a Google Maps URL."""
    decoded = unquote(target_url)

    # 1. Place name in path: /maps/place/Place+Name
    m_place = re.search(r"/maps/place/([^/@?]+)", decoded)
    if m_place:
        place = m_place.group(1).replace("+", " ").replace("%20", " ").strip()
        if place:
            return {
                "destination": place,
                "extracted_text": f"Google Maps location: {place}. Destination to plan the trip for: {place}.",
                "note": f"Place extracted from Maps URL: {place}",
            }

    # 2. Search query in params: ?q=Place+Name or ?query=Place+Name
    m_q = re.search(r"[?&](?:q|query)=([^&]+)", decoded)
    if m_q:
        place = m_q.group(1).replace("+", " ").replace("%20", " ").strip()
        if place:
            return {
                "destination": place,
                "extracted_text": f"Google Maps search: {place}. Destination to plan the trip for: {place}.",
                "note": f"Search query extracted from Maps URL: {place}",
            }

    # 3. Search in path: /maps/search/Place+Name
    m_search = re.search(r"/maps/search/([^/@?]+)", decoded)
    if m_search:
        term = m_search.group(1).replace("+", " ").replace("%20", " ").strip()
        if term:
            return {
                "destination": term,
                "extracted_text": f"Google Maps search: {term}. Destination to plan the trip for: {term}.",
                "note": f"Search path extracted from Maps URL: {term}",
            }

    # 4. Directions in path: /maps/dir/Stop1/Stop2/...
    m_dir_path = re.search(r"/maps/dir/([^?]+)", decoded)
    if m_dir_path:
        parts = [
            p.replace("+", " ").replace("%20", " ").strip()
            for p in m_dir_path.group(1).split("/")
            if p.strip() and not p.startswith("@")
        ]
        if parts:
            dest = parts[0]
            stops_str = ", ".join(parts)
            return {
                "destination": dest,
                "stops": parts,
                "extracted_text": f"Google Maps route with stops: {stops_str}. Plan a trip visiting these stops.",
                "note": f"Route with {len(parts)} stops extracted from Maps URL",
            }

    # 5. Directions in query params: origin, destination, waypoints
    m_origin = re.search(r"[?&]origin=([^&]+)", decoded)
    m_dest = re.search(r"[?&]destination=([^&]+)", decoded)
    if m_origin or m_dest:
        origin = m_origin.group(1).replace("+", " ").replace("%20", " ").strip() if m_origin else ""
        dest = m_dest.group(1).replace("+", " ").replace("%20", " ").strip() if m_dest else ""
        m_waypoints = re.search(r"[?&]waypoints=([^&]+)", decoded)
        waypoints = (
            [w.replace("+", " ").replace("%20", " ").strip() for w in m_waypoints.group(1).split("|")]
            if m_waypoints
            else []
        )
        all_stops = [s for s in [origin] + waypoints + [dest] if s]
        primary_dest = dest or origin or "Unknown"
        stops_str = " -> ".join(all_stops)
        return {
            "destination": primary_dest,
            "stops": all_stops,
            "extracted_text": f"Google Maps route: {stops_str}. Plan an itinerary including these stops.",
            "note": f"Directions route ({len(all_stops)} stops) extracted from Maps URL",
        }

    # 6. Coordinates: /@lat,lng
    m_coords = re.search(r"/@(-?\d+\.\d+),(-?\d+\.\d+)", decoded)
    if m_coords:
        lat, lng = m_coords.group(1), m_coords.group(2)
        return {
            "destination": f"{lat}, {lng}",
            "extracted_text": f"Google Maps geographic coordinates: {lat}, {lng}. Plan a trip for this destination area.",
            "note": f"Coordinates extracted from Maps URL: {lat}, {lng}",
        }

    return None


def _extract_google_maps(url: str) -> dict:
    """
    Extract destination, search query, directions stops, or coordinates from Google Maps URLs.
    Handles standard place URLs, search queries, directions routes, and resolves short links (maps.app.goo.gl).
    """
    parsed = _parse_maps_target(url)
    if parsed:
        return {"platform": "google_maps", **parsed}

    # If it's a short URL (maps.app.goo.gl, goo.gl/maps) or has no place yet, follow redirects
    if "goo.gl" in url.lower() or "google" in url.lower():
        try:
            with httpx.Client(headers=HEADERS, timeout=FETCH_TIMEOUT, follow_redirects=True) as client:
                r = client.get(url)
                final_url = str(r.url)
                parsed_final = _parse_maps_target(final_url)
                if parsed_final:
                    return {
                        "platform": "google_maps",
                        **parsed_final,
                        "note": parsed_final["note"] + " (resolved from short link)",
                    }

                # Fallback to page title if valid place name
                m_title = re.search(r"<title[^>]*>([^<]+)</title>", r.text, re.IGNORECASE)
                if m_title:
                    raw_title = m_title.group(1).replace("- Google Maps", "").replace("Google Maps", "").strip()
                    ignored = ["dynamic link not found", "before you continue", "error", "404", "consent", "not found"]
                    if len(raw_title) > 2 and not any(p in raw_title.lower() for p in ignored):
                        return {
                            "platform": "google_maps",
                            "destination": raw_title,
                            "extracted_text": f"Google Maps location: {raw_title}. Destination to plan the trip for: {raw_title}.",
                            "note": f"Place extracted from Maps page title: {raw_title}",
                        }
        except Exception as e:
            logger.warning(f"Failed to resolve Google Maps redirect: {e}")

    return {
        "platform": "google_maps",
        "extracted_text": "Google Maps location (place name could not be extracted from URL)",
        "note": "Generic Maps URL",
    }


def _extract_generic(url: str, html: str) -> dict:
    """Generic travel blog / website — use title + meta description."""
    title = _extract_meta(html, "title") or _extract_title(html) or ""
    description = _extract_meta(html, "description") or ""
    combined = f"{title}. {description}"
    return {
        "platform": "web",
        "extracted_text": _clean_text(combined)[:800],
        "note": "Title and description extracted from webpage",
    }


# ── Main fetch ─────────────────────────────────────────────────────────────────

def fetch_url_content(url: str) -> dict:
    """
    Fetch a URL and extract travel-relevant text.
    Always returns a dict — never raises (graceful degradation).

    Return shape:
      {
        "success": bool,
        "platform": str,
        "extracted_text": str,   # what gets added to the LLM prompt
        "destination": str | None,
        "note": str,             # human-readable status
        "error": str | None,
      }
    """
    url = url.strip()
    url_lower = url.lower()

    # Google Maps — check all forms including short links
    if (
        "maps.google" in url_lower
        or "google.com/maps" in url_lower
        or "goo.gl/maps" in url_lower
        or "maps.app.goo.gl" in url_lower
    ):
        result = _extract_google_maps(url)
        return {**result, "success": True, "error": None}

    # All other URLs — fetch HTML
    try:
        with httpx.Client(
            headers=HEADERS,
            timeout=FETCH_TIMEOUT,
            follow_redirects=True,
        ) as client:
            response = client.get(url)
            response.raise_for_status()
            html = response.text

        if "instagram.com" in url_lower:
            result = _extract_instagram(url, html)
        elif "youtube.com" in url_lower or "youtu.be" in url_lower:
            result = _extract_youtube(url, html)
        else:
            result = _extract_generic(url, html)

        if not result["extracted_text"] or len(result["extracted_text"]) < 10:
            return {
                "success": False,
                "platform": result.get("platform", "unknown"),
                "extracted_text": "",
                "note": "Could not extract meaningful content from this URL",
                "error": "Insufficient content extracted",
            }

        logger.info(f"URL extracted ({result['platform']}): {result['extracted_text'][:80]}...")
        return {**result, "success": True, "error": None}

    except httpx.TimeoutException:
        logger.warning(f"Timeout fetching URL: {url}")
        return {
            "success": False,
            "platform": "unknown",
            "extracted_text": "",
            "note": "URL fetch timed out",
            "error": "timeout",
        }
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        logger.warning(f"HTTP {status} fetching URL: {url}")

        if status == 403 or status == 401:
            note = "This URL requires login or is blocked. Atlas will still try to plan based on the URL itself."
        else:
            note = f"URL returned HTTP {status}"

        return {
            "success": False,
            "platform": "unknown",
            "extracted_text": "",
            "note": note,
            "error": f"http_{status}",
        }
    except Exception as e:
        logger.warning(f"Error fetching URL {url}: {e}")
        return {
            "success": False,
            "platform": "unknown",
            "extracted_text": "",
            "note": "Could not fetch this URL",
            "error": str(e)[:100],
        }
