// ── Enums ──────────────────────────────────────────────────────────────────────

export type TravelStyle =
  | 'relaxed'
  | 'adventure'
  | 'budget'
  | 'luxury'
  | 'backpacking'
  | 'romantic'
  | 'family'
  | 'party'
  | 'culture';

export type FoodPreference =
  | 'no_preference'
  | 'vegetarian'
  | 'vegan'
  | 'non_vegetarian'
  | 'halal'
  | 'jain';

export type AccommodationPreference =
  | 'budget'
  | 'mid_range'
  | 'luxury'
  | 'hostel'
  | 'hotel'
  | 'airbnb';

export type TransportationPreference =
  | 'public'
  | 'taxi'
  | 'rental_car'
  | 'walking'
  | 'mixed';

export type ActivityType =
  | 'accommodation'
  | 'food'
  | 'beach'
  | 'nature'
  | 'culture'
  | 'adventure'
  | 'shopping'
  | 'transport'
  | 'nightlife'
  | 'photography'
  | 'activity';

// ── Request Types ──────────────────────────────────────────────────────────────

export interface TripGenerateRequest {
  travel_input: string;
  additional_places?: string[];
  duration_days: number;
  start_date?: string;          // ISO date e.g. "2025-03-15" — enables weather forecast
  budget?: number;
  budget_type?: 'total' | 'per_person';
  currency?: string;
  travelers: number;
  starting_location?: string;
  travel_style: TravelStyle[];
  interests: string[];
  other_interests?: string;
  food_preferences: FoodPreference[];
  cuisine_preferences?: string[];
  transportation: TransportationPreference;
  accommodation: AccommodationPreference;
}

export interface TripRefineRequest {
  current_trip: TripData;
  instruction: string;
  preferences?: TripGenerateRequest;
}

// ── Weather ────────────────────────────────────────────────────────────────────

export type WeatherCondition = 'sunny' | 'cloudy' | 'foggy' | 'rainy' | 'snowy' | 'stormy'

export interface WeatherDay {
  day: number
  date: string
  description: string
  condition: WeatherCondition
  advice: string
  temp_max_c?: number
  temp_min_c?: number
  precipitation_mm?: number
  is_bad_weather: boolean
  avoid_outdoor: boolean
}

// ── Response Types ─────────────────────────────────────────────────────────────

export interface Activity {
  time: string;
  title: string;
  duration?: string;
  type: ActivityType;
  description?: string;
  why_selected?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface DayPlan {
  day: number;
  title: string;
  summary: string;
  activities: Activity[];
  weather?: WeatherDay;         // present when start_date was provided
}

export interface BudgetBreakdown {
  accommodation?: number;
  food?: number;
  transport?: number;
  activities?: number;
  miscellaneous?: number;
  total: number;
  currency: string;
  note?: string;
}

export interface FoodRecommendation {
  name: string;
  reason?: string;
}

export interface TransportationInfo {
  recommendation: string;
  estimated_cost?: string;
}

export interface TripData {
  destination: string;
  summary: string;
  recommended_duration: number;
  estimated_budget: BudgetBreakdown;
  days: DayPlan[];
  food_recommendations: FoodRecommendation[];
  transportation: TransportationInfo;
  tips: string[];
  optional_places: string[];
  why_this_trip?: string;
  start_date?: string;          // ISO date if provided
  has_weather: boolean;         // true when real forecast was fetched
}

export interface TripGenerateResponse {
  success: boolean;
  trip?: TripData;
  trip_id?: string;
  error?: string;
}

export interface ParseReelRequest {
  url?: string;
  caption_or_notes?: string;
}

export interface ParseReelResponse {
  success: boolean;
  destination: string;
  suggested_duration: number;
  must_visit_stops: string[];
  suggested_styles: TravelStyle[];
  trip_summary: string;
  reel_url?: string;
  error?: string;
}

// ── UI State ───────────────────────────────────────────────────────────────────

export interface PlannerState {
  travelInput: string;
  additionalPlaces: string[];
  durationDays: number;
  startDate: string;            // ISO date string, empty = no date
  budget: number | undefined;
  budgetType: 'total' | 'per_person';
  currency: string;
  travelers: number;
  startingLocation: string;
  travelStyle: TravelStyle[];
  interests: string[];
  otherInterests: string;
  foodPreferences: FoodPreference[];
  cuisinePreferences: string[];
  transportation: TransportationPreference;
  accommodation: AccommodationPreference;
}
