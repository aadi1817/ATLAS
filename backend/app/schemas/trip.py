from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import date


# ── Enums ──────────────────────────────────────────────────────────────────────

class TravelStyle(str, Enum):
    relaxed = "relaxed"
    adventure = "adventure"
    budget = "budget"
    luxury = "luxury"
    backpacking = "backpacking"
    romantic = "romantic"
    family = "family"
    party = "party"
    culture = "culture"


class FoodPreference(str, Enum):
    no_preference = "no_preference"
    vegetarian = "vegetarian"
    vegan = "vegan"
    non_vegetarian = "non_vegetarian"
    halal = "halal"
    jain = "jain"


class AccommodationPreference(str, Enum):
    budget = "budget"
    mid_range = "mid_range"
    luxury = "luxury"
    hostel = "hostel"
    hotel = "hotel"
    airbnb = "airbnb"


class TransportationPreference(str, Enum):
    public = "public"
    taxi = "taxi"
    rental_car = "rental_car"
    walking = "walking"
    mixed = "mixed"


# ── Request Schemas ────────────────────────────────────────────────────────────

class TripGenerateRequest(BaseModel):
    travel_input: str = Field(..., min_length=3, max_length=5000)
    additional_places: Optional[List[str]] = Field(default_factory=list)
    duration_days: int = Field(default=5, ge=1, le=30)
    start_date: Optional[date] = None          # NEW — enables weather forecast
    budget: Optional[int] = Field(default=None, ge=0)
    budget_type: Optional[str] = Field(default="total")
    currency: str = Field(default="INR")
    travelers: int = Field(default=2, ge=1, le=20)
    starting_location: Optional[str] = None
    travel_style: List[TravelStyle] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    other_interests: Optional[str] = None
    food_preferences: List[FoodPreference] = Field(default_factory=list)
    cuisine_preferences: List[str] = Field(default_factory=list)
    transportation: TransportationPreference = TransportationPreference.mixed
    accommodation: AccommodationPreference = AccommodationPreference.mid_range


class TripRefineRequest(BaseModel):
    current_trip: Dict[str, Any]
    instruction: str = Field(..., min_length=3, max_length=1000)
    preferences: Optional[Dict[str, Any]] = None  # original TripGenerateRequest as dict


# ── Response Schemas ───────────────────────────────────────────────────────────

class WeatherDay(BaseModel):
    day: int
    date: str
    description: str
    condition: str          # sunny / cloudy / rainy / snowy / stormy / foggy
    advice: str
    temp_max_c: Optional[int] = None
    temp_min_c: Optional[int] = None
    precipitation_mm: Optional[float] = None
    is_bad_weather: bool = False
    avoid_outdoor: bool = False


class Activity(BaseModel):
    time: str
    title: str
    duration: Optional[str] = None
    type: str  # e.g. "beach", "food", "accommodation", "activity", "transport"
    description: Optional[str] = None
    why_selected: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DayPlan(BaseModel):
    day: int
    title: str
    summary: str
    activities: List[Activity]
    weather: Optional[WeatherDay] = None    # populated after generation


class BudgetBreakdown(BaseModel):
    accommodation: Optional[int] = None
    food: Optional[int] = None
    transport: Optional[int] = None
    activities: Optional[int] = None
    miscellaneous: Optional[int] = None
    total: int
    currency: str = "INR"
    note: Optional[str] = "AI-generated estimates only — not live prices"


class FoodRecommendation(BaseModel):
    name: str
    reason: Optional[str] = None


class TransportationInfo(BaseModel):
    recommendation: str
    estimated_cost: Optional[str] = None


class TripData(BaseModel):
    destination: str
    summary: str
    recommended_duration: int
    estimated_budget: BudgetBreakdown
    days: List[DayPlan]
    food_recommendations: List[FoodRecommendation] = Field(default_factory=list)
    transportation: TransportationInfo
    tips: List[str] = Field(default_factory=list)
    optional_places: List[str] = Field(default_factory=list)
    why_this_trip: Optional[str] = None
    start_date: Optional[str] = None       # ISO date string if provided
    has_weather: bool = False              # True if real forecast was fetched


class TripGenerateResponse(BaseModel):
    success: bool
    trip: Optional[TripData] = None
    trip_id: Optional[str] = None
    error: Optional[str] = None


class TripRefineResponse(BaseModel):
    success: bool
    trip: Optional[TripData] = None
    error: Optional[str] = None


class ParseReelRequest(BaseModel):
    url: Optional[str] = None
    caption_or_notes: Optional[str] = None


class ParseReelResponse(BaseModel):
    success: bool
    destination: str
    suggested_duration: int = 5
    must_visit_stops: List[str] = Field(default_factory=list)
    suggested_styles: List[str] = Field(default_factory=list)
    trip_summary: str = ""
    reel_url: Optional[str] = None
    error: Optional[str] = None

