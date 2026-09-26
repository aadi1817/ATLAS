# Atlas 🧭 — Autonomous AI Travel Planner

<p align="center">
  <img src="frontend/public/atlas-icon.svg" width="96" height="96" alt="Atlas Logo" />
</p>

<p align="center">
  <strong>From Social Media Inspiration to a Ready-to-Travel Itinerary in Seconds.</strong><br />
  Drop an Instagram Reel, TikTok, YouTube Short, Google Maps link, or freeform idea — Atlas autonomously extracts places, checks live weather forecasts, calculates realistic budgets, and orchestrates an interactive day-by-day plan with GPS mapping.
</p>

<p align="center">
  <a href="#key-features"><img src="https://img.shields.io/badge/Status-Active_Development-0284c7?style=for-the-badge" alt="Status" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#llm-architecture"><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" /></a>
  <a href="#live-weather-integration"><img src="https://img.shields.io/badge/Open--Meteo-Weather_API-ea580c?style=for-the-badge" alt="Open-Meteo" /></a>
  <a href="#database--persistence"><img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Instant Frontend Demo (Zero Backend / Mock Mode)](#1-instant-frontend-demo-zero-backend--mock-mode)
  - [2. Full-Stack Setup (Backend + Real AI)](#2-full-stack-setup-backend--real-ai)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [Core Workflows Deep Dive](#-core-workflows-deep-dive)
  - [1. Social Reel & Link Ingestion](#1-social-reel--link-ingestion)
  - [2. Weather-Aware Activity Scheduling](#2-weather-aware-activity-scheduling)
  - [3. Real-Time Conversational Refinement](#3-real-time-conversational-refinement)
  - [4. Latency-Optimized Gemini Fallback Chain](#4-latency-optimized-gemini-fallback-chain)
- [Database & Offline Resilience](#-database--offline-resilience)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌟 Overview

Most travel planning tools fall into two extremes: either rigid pre-packaged tour listings or generic ChatGPT walls of text that lack real-world logistics, budgets, and geographic awareness.

**Atlas bridges the gap between social inspiration and logistical reality.** 

When you discover a viral travel spot on Instagram or YouTube, planning a trip around it usually takes hours of copying names, opening Google Maps, researching weather, and budgeting. Atlas automates this entire lifecycle:

1. **Paste & Ingest**: Drop an Instagram Reel URL, YouTube travel vlog, or Google Maps location.
2. **Deep Extraction**: Atlas extracts locations, hashtags, and captions via Open Graph scraping and heuristic fallback parsers.
3. **Environmental Context**: Syncs with Open-Meteo to inspect real forecasted precipitation, temperatures, and WMO weather codes for the trip dates.
4. **Autonomous Synthesis**: Calls Google Gemini (`gemini-3.8-flash`) with strict JSON schemas to craft realistic travel times, activity pacing, geographic coordinates, and meal recommendations.
5. **Interactive Exploration & Refinement**: Visualize the trip on an interactive Leaflet map, review category budget breakdowns, and modify any day using natural language instructions.

---

## ✨ Key Features

### 🎬 1. Social Media & URL Ingestion
- **Instagram Reel Importer**: Automatically extracts destinations, must-visit stops, duration, and travel styles from Reel URLs and captions.
- **Multi-Source Scraping**: Inspects Open Graph metadata (`og:title`, `og:description`, `og:site_name`) from YouTube videos, Google Maps URLs, and generic travel blogs.
- **Curated Trending Inspirations**: Integrated 1-click presets for popular destinations (Bali, Kyoto, Amalfi Coast, Swiss Alps).

### 🌦️ 2. Dynamic Weather-Aware Itinerary Routing
- **Real-Time Open-Meteo Integration**: Geocodes destinations and fetches multi-day forecasts with zero API key requirement.
- **Weather Guarding**: Identifies rainy, foggy, or stormy days. The AI engine automatically adapts: swapping outdoor hikes and beaches for museums, galleries, cafes, and indoor cultural activities.
- **Visual Weather Indicators**: Displays temperature ranges, precipitation likelihood, and outdoor suitability warnings per day.

### 🗺️ 3. Interactive Geographic Visualization (Leaflet)
- **High-Fidelity Maps**: Custom Leaflet vector map with individual markers for every scheduled activity.
- **Color-Coded Days**: Markers color-indexed by day with emoji badges matching activity categories (🏨 accommodation, 🍽️ dining, 🏖️ beach, 🧗 adventure, 🏛️ culture).
- **One-Click Navigation**: Integrated links to launch place searches directly in Google Maps.

### 💬 4. Conversational In-Place Refinement
- **Zero-Friction Updates**: Adjust itineraries without starting over.
- **Quick Refinement Chips**: Instant 1-tap presets like *"Make it more budget-friendly"*, *"Add more outdoor adventure"*, *"Add authentic local food stops"*, or *"Relax the daily pace"*.
- **Natural Language Prompts**: Enter freeform requests like *"Swap Day 3 morning for a cooking class and adjust the afternoon accordingly"*.

### 💰 5. Destination-Aware Budget Engine
- **Itemized Allocations**: Calculates broken-down estimates across Accommodation, Dining, Local Transit, Activities, and Miscellaneous fees.
- **Sanity Checks**: Validates LLM estimates against baseline destination cost thresholds (e.g., Southeast Asia vs. Western Europe) to flag unrealistic projections.
- **Multi-Currency Support**: Switch between INR, USD, EUR, GBP, and local destination currencies.

### ⚡ 6. High-Performance Engineering & Resilience
- **Parallel Dispatch**: LLM prompt execution and weather geocoding run concurrently via `asyncio.gather()`.
- **Zero Chain-of-Thought Latency**: Utilizes `thinking_budget=0` on flash models, boosting response speeds by ~40%.
- **Multi-Model Fallback Chain**: Transparent automatic failover across `gemini-3.8-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-3.7-flash` ➔ `gemini-3.5-flash`.
- **Zero-DB Graceful Degradation**: Runs without PostgreSQL if a local database isn't configured, making local development instantaneous.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User([User / Browser])

    subgraph Frontend ["Frontend (React 18 + Vite + Tailwind CSS)"]
        UI[Home / Planner / TripResult UI]
        State[Planner State & Mock Engine]
        Map[Leaflet Interactive Map]
        UI --> State
        UI --> Map
    end

    subgraph BackendGateway ["Backend Gateway (FastAPI)"]
        Router["/api/trips Routes"]
        Pydantic["Pydantic v2 Validation"]
        Router --> Pydantic
    end

    subgraph Services ["Core Services Engine"]
        Parser["Input & Social Parser\n(OpenGraph + Heuristics)"]
        WeatherService["Weather Service\n(Open-Meteo Geocoding + Forecast)"]
        LLM["Itinerary Generator\n(Google Gemini SDK)"]
        BudgetService["Budget Estimator\n(Sanity Check & Cost Matrix)"]
    end

    subgraph ExternalAPIs ["External Providers"]
        MeteoAPI[("Open-Meteo API\n(No Auth Required)")]
        GeminiAPI[("Google Gemini AI\ngemini-3.8-flash")]
    end

    subgraph Storage ["Persistence Layer"]
        DB[("PostgreSQL\n(SQLAlchemy 2.0)")]
        Fallback[("In-Memory Session\n(Zero-DB Fallback)")]
    end

    User <-->|HTTP / JSON| Frontend
    Frontend <-->|REST API| BackendGateway
    Pydantic --> Parser
    Parser --> WeatherService
    WeatherService <-->|Async GET| MeteoAPI
    WeatherService -->|Parallel Async| LLM
    LLM <-->|Structured JSON| GeminiAPI
    LLM --> BudgetService
    BudgetService --> Router
    Router -.->|Persist Trip| DB
    DB -.->|Fallback if Offline| Fallback
```

---

## 💻 Tech Stack

### Frontend
| Component | Technology | Version | Description |
|---|---|---|---|
| **Core Framework** | [React](https://react.dev/) | `^18.3.1` | Component-driven UI architecture |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.6.3` | End-to-end type safety |
| **Build Tool** | [Vite](https://vitejs.dev/) | `^5.4.8` | Lightning-fast HMR and bundling |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^3.4.13` | Utility-first responsive design & micro-animations |
| **Icons** | [Lucide React](https://lucide.dev/) | `^0.447.0` | Crisp modern vector iconography |
| **Maps** | [Leaflet](https://leafletjs.com/) | `^1.9.4` | Interactive mobile-friendly map rendering |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^6.26.2` | Single-page client-side route management |
| **HTTP Client** | [Axios](https://axios-http.com/) | `^1.7.7` | Promise-based backend communication |

### Backend
| Component | Technology | Version | Description |
|---|---|---|---|
| **Web Framework** | [FastAPI](https://fastapi.tiangolo.com/) | `>=0.115.0` | Asynchronous high-performance Python API |
| **ASGI Server** | [Uvicorn](https://www.uvicorn.org/) | `>=0.30.0` | Production-grade lightning-fast ASGI server |
| **AI / LLM** | [Google GenAI SDK](https://github.com/google-gemini/generative-ai-python) | `>=2.25.0` | Official client for Google Gemini 3 models |
| **Validation** | [Pydantic](https://docs.pydantic.dev/) | `>=2.9.0` | Robust schema definition and input validation |
| **HTTP Async Client** | [HTTPX](https://www.python-httpx.org/) | `>=0.27.0` | Async HTTP requests for weather & Open Graph |
| **ORM & Database** | [SQLAlchemy](https://www.sqlalchemy.org/) & [Psycopg2](https://www.psycopg.org/) | `>=2.0.35` | Database abstraction & connection pooling |
| **Database Migrations** | [Alembic](https://alembic.sqlalchemy.org/) | `>=1.13.0` | Schema migrations management |

---

## 📂 Project Directory Structure

```text
atlas/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── trip.py              # REST API route handlers (/generate, /refine, /parse-reel, /{id})
│   │   ├── config.py                # Environment configuration & pydantic-settings
│   │   ├── database/
│   │   │   └── connection.py        # SQLAlchemy engine, session maker & connection pool
│   │   ├── models/
│   │   │   └── trip.py              # PostgreSQL SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── trip.py              # Pydantic models (Enums, Request/Response payloads)
│   │   ├── services/
│   │   │   ├── budget_estimator.py  # Budget breakdown calculation & destination sanity checks
│   │   │   ├── input_parser.py      # Input classification (URL vs location vs text)
│   │   │   ├── itinerary_generator.py # Gemini prompt construction, fallback chain & JSON repair
│   │   │   ├── social_parser.py     # Instagram Reel parser with AI + regex fallbacks
│   │   │   ├── url_extractor.py     # Open Graph meta tag and content scraper
│   │   │   └── weather_service.py   # Open-Meteo geocoding & multi-day forecast fetcher
│   │   └── main.py                  # FastAPI application entrypoint & CORS middleware
│   ├── .env.example                 # Backend environment variable template
│   └── requirements.txt             # Python backend dependencies
│
├── frontend/
│   ├── public/
│   │   └── atlas-icon.svg           # Application SVG logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityCard.tsx     # Activity card with timeline, category emoji & maps links
│   │   │   ├── AIProgress.tsx       # Multi-stage animated loading screen with travel quotes
│   │   │   ├── BudgetBreakdown.tsx  # Cost distribution card with category visual metrics
│   │   │   ├── DayCard.tsx          # Collapsible per-day itinerary card with weather status
│   │   │   ├── GenerateButton.tsx   # Action CTA with glowing animations
│   │   │   ├── InstagramReelImporter.tsx # Reel parser modal with curated presets & URL extraction
│   │   │   ├── InterestSelector.tsx # Interactive interest tags selector
│   │   │   ├── PreferenceForm.tsx   # Duration, budget, travelers, food & stay preferences
│   │   │   ├── RefinePanel.tsx      # Conversational refinement widget with quick-action chips
│   │   │   ├── TravelInput.tsx      # Multi-modal input container (free text, links, pins)
│   │   │   ├── TravelStyleSelector.tsx # Travel style toggle chips (relaxed, adventure, etc.)
│   │   │   ├── TripHeader.tsx       # Trip hero card with quick statistics, sharing & export
│   │   │   ├── TripMap.tsx          # Leaflet map component with color-coded day markers
│   │   │   └── TripTips.tsx         # Weather outlook, dining guide, transit & local tips
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page with hero, curated destinations & testimonials
│   │   │   ├── Planner.tsx          # Step-by-step trip configuration workspace
│   │   │   └── TripResult.tsx       # Complete generated itinerary view & control dashboard
│   │   ├── services/
│   │   │   ├── api.ts               # Axios client interfacing with FastAPI backend
│   │   │   └── mockData.ts          # Comprehensive offline mock data for zero-backend demo
│   │   ├── types/
│   │   │   └── trip.ts              # Shared TypeScript interfaces & types
│   │   ├── utils/
│   │   │   └── maps.ts              # Coordinate parsing and Google Maps URL formatters
│   │   ├── App.tsx                  # Main router setup
│   │   ├── index.css                # Global CSS, Tailwind layers & custom animations
│   │   └── main.tsx                 # React DOM mount point
│   ├── .env.example                 # Frontend environment template
│   ├── package.json                 # Node dependencies and scripts
│   ├── tailwind.config.js           # Tailwind theme customizations
│   └── vite.config.ts               # Vite configuration
│
└── README.md                        # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download](https://nodejs.org/))
- **Python**: `3.10`, `3.11`, or `3.12` ([Download](https://python.org/)) *(Note: Python 3.14 is currently unsupported by some ML dependencies)*
- **Google Gemini API Key**: Free tier available at [Google AI Studio](https://aistudio.google.com/)
- **PostgreSQL** *(Optional)*: `v14+` for persistent trip storage (app operates in memory if DB is absent)

---

### 1. Instant Frontend Demo (Zero Backend / Mock Mode)

You can launch and explore the complete UI and interactive itinerary in under 60 seconds without installing Python or setting up an API key:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/atlas.git
cd atlas/frontend

# 2. Install dependencies
npm install

# 3. Create your local env file with mock mode enabled
cp .env.example .env.local
```

Ensure `frontend/.env.local` contains:
```env
VITE_USE_MOCK=true
```

Start the Vite development server:
```bash
npm run dev
```

Navigate to **http://localhost:5173** in your browser. Clicking **"Generate My Trip"** will trigger the realistic multi-step loading sequence and load a full Bali itinerary with maps, weather, and budgeting!

---

### 2. Full-Stack Setup (Backend + Real AI)

To power Atlas with live Google Gemini generation, Instagram reel parsing, and real weather forecasts:

#### Step 1: Set Up Backend

```bash
# From repository root
cd backend

# Create and activate a Python virtual environment
# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate

# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

Edit `backend/.env` with your API credentials:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/atlas
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
GEMINI_MODEL=gemini-3.8-flash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
```

*(If you don't have PostgreSQL installed, leave `DATABASE_URL` as is; Atlas will log a harmless warning and continue running in stateless mode).*

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

Verify backend is live:
- **API Health**: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Step 2: Configure Frontend for Live Backend

In another terminal window:

```bash
cd frontend

# Set mock mode to false
# Edit frontend/.env.local or frontend/.env:
```

```env
VITE_USE_MOCK=false
```

Start the frontend dev server:
```bash
npm run dev
```

Open **http://localhost:5173**. Atlas is now fully wired to live Gemini AI generation and Open-Meteo forecasts!

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | `string` | *(Required)* | Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/) |
| `GEMINI_MODEL` | `string` | `gemini-3.8-flash` | Gemini model variant (`gemini-3.8-flash`, `gemini-3.6-flash`, etc.) |
| `DATABASE_URL` | `string` | `postgresql://...` | PostgreSQL connection URI. If unreachable, backend defaults to stateless mode |
| `CORS_ORIGINS` | `string` | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `ENVIRONMENT` | `string` | `development` | Environment tier (`development` or `production`) |
| `GOOGLE_MAPS_API_KEY`| `string` | `""` | *(Optional)* Maps API key for future extended geocoding services |

### Frontend (`frontend/.env.local`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `VITE_USE_MOCK` | `boolean` | `false` | When `true`, intercepts requests and returns rich static mock itineraries |

---

## 📡 API Reference

Interactive OpenAPI documentation is automatically served at `/docs` (Swagger UI) and `/redoc` (ReDoc).

### 1. Generate Itinerary
`POST /api/trips/generate`

Generates an end-to-end multi-day trip plan matching user constraints, weather conditions, and budget.

**Sample Request Body:**
```json
{
  "travel_input": "6 days in Tokyo focusing on ramen culture, Akihabara tech, and teamLab",
  "additional_places": ["Shibuya Sky", "Tsukiji Outer Market"],
  "duration_days": 6,
  "start_date": "2026-10-15",
  "budget": 120000,
  "budget_type": "total",
  "currency": "INR",
  "travelers": 2,
  "travel_style": ["culture", "relaxed"],
  "interests": ["Food & Cuisine", "Technology", "Photography"],
  "food_preferences": ["no_preference"],
  "transportation": "public",
  "accommodation": "mid_range"
}
```

**Sample Response Body (Truncated):**
```json
{
  "success": true,
  "trip_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "trip": {
    "destination": "Tokyo, Japan",
    "summary": "An electrifying 6-day journey immersing in Tokyo's culinary wonders, neon anime hubs, and futuristic art exhibits.",
    "recommended_duration": 6,
    "has_weather": true,
    "estimated_budget": {
      "accommodation": 45000,
      "food": 32000,
      "transport": 14000,
      "activities": 22000,
      "miscellaneous": 7000,
      "total": 120000,
      "currency": "INR",
      "note": "AI-generated estimates only — not live prices"
    },
    "days": [
      {
        "day": 1,
        "title": "Arrival & Neon Lights of Shibuya",
        "summary": "Settle in, cross the famous Shibuya Crossing, and take in the panoramic skyline from Shibuya Sky.",
        "weather": {
          "day": 1,
          "date": "2026-10-15",
          "description": "Clear sky",
          "condition": "sunny",
          "advice": "Great weather for outdoor activities.",
          "temp_max_c": 22,
          "temp_min_c": 15,
          "precipitation_mm": 0.0,
          "is_bad_weather": false,
          "avoid_outdoor": false
        },
        "activities": [
          {
            "time": "03:00 PM",
            "title": "Check-in at Shinjuku Granbell Hotel",
            "duration": "1 hour",
            "type": "accommodation",
            "location": "Kabukicho, Shinjuku",
            "latitude": 35.6963,
            "longitude": 139.7047,
            "description": "Drop luggage and recharge before evening exploration."
          },
          {
            "time": "05:30 PM",
            "title": "Shibuya Sky Observation Deck",
            "duration": "2 hours",
            "type": "photography",
            "location": "Shibuya Scramble Square",
            "latitude": 35.6585,
            "longitude": 139.7023,
            "description": "Watch the sunset across Tokyo's sprawling skyline.",
            "why_selected": "Matches your interest in photography and iconic viewpoints."
          }
        ]
      }
    ],
    "food_recommendations": [
      { "name": "Ichiran Ramen Shibuya", "reason": "Famous tonkotsu broth served in focused solo dining booths." }
    ],
    "transportation": {
      "recommendation": "Use a 72-hour Tokyo Subway Ticket paired with a Suica or Pasmo IC card for JR lines.",
      "estimated_cost": "¥3,500 (~₹2,000) per person"
    },
    "tips": [
      "Carry some cash as small ramen ticket vending machines rarely take international cards.",
      "Pre-book teamLab Planets tickets at least 3 weeks in advance."
    ]
  }
}
```

---

### 2. Parse Social Media Reel
`POST /api/trips/parse-reel`

Extracts structured travel parameters directly from an Instagram Reel or TikTok URL and caption.

**Request:**
```json
{
  "url": "https://www.instagram.com/reel/C-4Z-yvS8pD/",
  "caption_or_notes": "Top 4 Bali places you must experience! 1. Seminyak Beach 2. Tegalalang Rice Terraces 3. Uluwatu Temple 4. Cretya Sunset Pool Club #bali #travel"
}
```

**Response:**
```json
{
  "success": true,
  "destination": "Bali, Indonesia",
  "suggested_duration": 5,
  "must_visit_stops": [
    "Seminyak Beach",
    "Tegalalang Rice Terraces",
    "Uluwatu Temple",
    "Cretya Sunset Pool Club"
  ],
  "suggested_styles": ["relaxed", "culture"],
  "trip_summary": "A quintessential Bali itinerary highlighting iconic clifftop temples, lush jungle terraces, and vibrant coastal beach clubs.",
  "reel_url": "https://www.instagram.com/reel/C-4Z-yvS8pD/"
}
```

---

### 3. Refine Itinerary
`POST /api/trips/refine`

Refines an existing itinerary using conversational natural language instructions while preserving user preferences and destination context.

**Request:**
```json
{
  "current_trip": { "...": "Existing TripData object" },
  "instruction": "Swap out any party spots on Day 2 for historic temples, and add an authentic sushi lunch",
  "preferences": { "...": "Original TripGenerateRequest dictionary" }
}
```

**Response:**
```json
{
  "success": true,
  "trip": { "...": "Updated TripData with modified Day 2 activities and recalculated budget" }
}
```

---

### 4. Retrieve Saved Trip
`GET /api/trips/{trip_id}`

Retrieves a previously generated and stored trip by UUID from the PostgreSQL database.

---

### 5. Health Check
`GET /health`

**Response:**
```json
{ "status": "ok", "service": "Atlas API" }
```

---

## 🔬 Core Workflows Deep Dive

### 1. Social Reel & Link Ingestion
When a user pastes a link into the input bar:
1. `classify_input()` detects the domain pattern (`instagram.com`, `youtube.com`, `maps.google.com`).
2. `url_extractor.py` performs a lightweight, non-headless HTTP GET using custom User-Agent headers to extract Open Graph metadata (`og:title`, `og:description`).
3. If an Instagram Reel is parsed via `/api/trips/parse-reel`, `social_parser.py` submits the URL metadata to Gemini with a strict schema to extract:
   - Primary destination & region
   - Recommended duration in days
   - Discrete landmark names for the `additional_places` list
   - Matching `TravelStyle` tags
4. **Heuristic Resilience**: If the social post is rate-limited or private, regex heuristic extractors parse numbered lists (e.g. `1. Seminyak Beach`) and travel hashtags (`#bali`, `#kyoto`) to ensure extraction never completely fails.

### 2. Weather-Aware Activity Scheduling
```
User selects start_date (within 16 days)
             │
             ▼
Open-Meteo Geocoding API resolves coordinates
             │
             ▼
Open-Meteo Forecast API returns daily WMO weather codes & precipitation
             │
             ▼
Code categorized into: sunny / cloudy / foggy / rainy / snowy / stormy
             │
             ▼
Injected into Gemini Prompt:
"Day 3: Heavy rain expected (18mm). You MUST schedule indoor activities only."
             │
             ▼
Gemini schedules indoor museums, cafes & cultural landmarks for Day 3
```

### 3. Real-Time Conversational Refinement
Rather than generating an itinerary from scratch:
- The frontend passes the complete `current_trip` JSON along with the user's textual request (e.g., *"Make it cheaper"*).
- The prompt instructs Gemini to act as an itinerary editor: modify only the requested items, maintain logistical coherence (geographic proximity of consecutive activities), and re-balance the budget breakdown.
- The returned JSON replaces the view instantly without a page reload.

### 4. Latency-Optimized Gemini Fallback Chain
Atlas implements proactive speed optimizations:
- `thinking_budget=0`: Bypasses reasoning token generation for Gemini flash models, saving significant round-trip time.
- `asyncio.gather()`: Concurrently requests weather geocoding and formats LLM context.
- **Failover Chain**: In the event of temporary rate limits or quota exhausts on the primary model, Atlas cascades automatically:
  $$\text{gemini-3.8-flash} \longrightarrow \text{gemini-3.1-flash-lite} \longrightarrow \text{gemini-3.7-flash} \longrightarrow \text{gemini-3.5-flash}$$

---

## 💾 Database & Offline Resilience

Atlas uses **SQLAlchemy 2.0** with **PostgreSQL** for trip persistence.

### Data Schema (`trips` table)
```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination VARCHAR(255),
    travel_input TEXT NOT NULL,
    preferences_json JSONB NOT NULL,
    generated_trip_json JSONB,
    status VARCHAR(50) DEFAULT 'generated',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Stateless Dev Mode
To make onboarding effortless for contributors who don't have a local PostgreSQL instance running:
- The database connection pool initializes with a 2-second timeout.
- If PostgreSQL is unreachable, the startup hook logs:
  `[WARNING] Database setup failed (non-fatal for dev)`
- All trip generation, weather syncing, and refinement continue functioning without errors.

---

## ❓ Troubleshooting & FAQ

<details>
<summary><strong>Q: Why does trip generation fail with "Gemini API key not configured"?</strong></summary>

Ensure you have created a `.env` file in the `backend/` directory (`backend/.env`) containing:
```env
GEMINI_API_KEY=your_actual_key_from_google_ai_studio
```
Make sure there are no trailing quotes or whitespace around the key.
</details>

<details>
<summary><strong>Q: Why is weather data showing as not available?</strong></summary>

Weather forecasts are powered by Open-Meteo and are available for trip start dates within **16 days** of the current date. If you select a date further out or do not provide a start date, Atlas generates seasonal recommendations instead.
</details>

<details>
<summary><strong>Q: Can I use Atlas completely offline?</strong></summary>

Yes! Set `VITE_USE_MOCK=true` in `frontend/.env.local`. The frontend will operate completely offline with sample itineraries, interactive maps, and budget breakdowns.
</details>

<details>
<summary><strong>Q: Why am I seeing Python version errors during pip install?</strong></summary>

Atlas backend requires Python 3.10, 3.11, or 3.12. Certain machine learning wheels and binary dependencies do not yet have stable wheels for Python 3.14. Check your version with `python --version`.
</details>

<details>
<summary><strong>Q: How do I change the default currency?</strong></summary>

You can select your preferred currency (INR, USD, EUR, GBP) directly in the **PreferenceForm** on the `/plan` page, or configure it in the `TripGenerateRequest` JSON payload.
</details>

---

## 🗺️ Roadmap

- [x] Natural language trip generation with structured JSON schemas
- [x] Instagram Reel and social post metadata extraction
- [x] Real-time Open-Meteo weather integration and rain-adaptive itineraries
- [x] Leaflet map integration with custom color-coded day pins
- [x] Conversational natural language itinerary refinement
- [x] Zero-backend mock mode for rapid UI testing
- [ ] Export trip itineraries to clean PDF and Apple Wallet / Google Calendar passes
- [ ] Multi-city route optimization (e.g. Tokyo ➔ Kyoto ➔ Osaka)
- [ ] Collaborative trip planning with shareable live sync links
- [ ] Flight and accommodation live pricing hooks (Skyscanner / Booking.com affiliates)

---

## 🤝 Contributing

Contributions are warmly welcomed! To get started:

1. **Fork the repository**
2. **Create your feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

Please ensure your code passes TypeScript linting (`npm run lint` in `frontend`) and Python formatting standards.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for curious travelers and digital nomads.
</p>
