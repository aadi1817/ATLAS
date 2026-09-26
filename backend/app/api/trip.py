import logging
import uuid
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.trip import Trip
from app.schemas.trip import (
    TripGenerateRequest,
    TripGenerateResponse,
    TripRefineRequest,
    TripRefineResponse,
    ParseReelRequest,
    ParseReelResponse,
)
from app.services.itinerary_generator import generate_itinerary, refine_itinerary
from app.services.social_parser import parse_instagram_reel
from app.config import settings

router = APIRouter(prefix="/api/trips", tags=["trips"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=TripGenerateResponse)
async def generate_trip(
    request: TripGenerateRequest,
    db: Session = Depends(get_db),
):
    if not settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.",
        )

    try:
        logger.info(f"Generating trip: {request.travel_input[:80]}...")
        trip_data = await generate_itinerary(request)   # ← awaited

        generated_id = uuid.uuid4()
        trip_id_str = str(generated_id)
        try:
            trip_record = Trip(
                id=generated_id,
                destination=trip_data.destination,
                travel_input=request.travel_input,
                preferences_json=request.model_dump(mode="json"),
                generated_trip_json=trip_data.model_dump(mode="json"),
                status="generated",
            )
            db.add(trip_record)
            db.commit()
            db.refresh(trip_record)
            trip_id_str = str(trip_record.id)
        except Exception as db_err:
            logger.warning(f"DB save skipped: {db_err}")
            try:
                db.rollback()
            except Exception:
                pass

        return TripGenerateResponse(success=True, trip=trip_data, trip_id=trip_id_str)

    except ValueError as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Atlas couldn't generate your trip right now. Please try again.",
        )


@router.post("/parse-reel", response_model=ParseReelResponse)
async def parse_reel(request: ParseReelRequest):
    """
    Intelligently extracts travel itinerary details (destination, duration, stops, styles)
    from an Instagram Reel URL and its caption/notes.
    """
    try:
        logger.info(f"Parsing Instagram Reel: url={request.url} caption_len={len(request.caption_or_notes or '')}")
        result = await parse_instagram_reel(request.url, request.caption_or_notes)
        return result
    except Exception as e:
        logger.error(f"Reel parsing error: {e}", exc_info=True)
        return ParseReelResponse(
            success=False,
            destination="Unknown",
            error=str(e),
        )


@router.post("/refine", response_model=TripRefineResponse)
async def refine_trip(request: TripRefineRequest):
    if not settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured.",
        )

    try:
        logger.info(f"Refining: {request.instruction[:80]}...")
        refined = await refine_itinerary(              # ← awaited
            request.current_trip, request.instruction, request.preferences
        )
        return TripRefineResponse(success=True, trip=refined)

    except ValueError as e:
        logger.error(f"Refine error: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected refine error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Atlas couldn't refine your trip right now. Please try again.",
        )


@router.get("/{trip_id}", response_model=TripGenerateResponse)
async def get_trip(trip_id: str, db: Session = Depends(get_db)):
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
    except Exception as db_err:
        logger.warning(f"DB query failed: {db_err}")
        trip = None

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    from app.schemas.trip import TripData
    return TripGenerateResponse(
        success=True,
        trip=TripData(**trip.generated_trip_json),
        trip_id=str(trip.id),
    )
