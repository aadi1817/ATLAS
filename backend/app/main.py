import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.trip import router as trip_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Atlas backend starting up...")
    try:
        from app.database.connection import create_tables
        create_tables()
        logger.info("Database tables ready.")
    except Exception as e:
        logger.warning(f"Database setup failed (non-fatal for dev): {e}")
    yield
    logger.info("Atlas backend shutting down.")


app = FastAPI(
    title="Atlas — AI Travel Planner",
    description="Backend API for the Atlas AI-powered travel planning application.",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = settings.cors_origins_list
is_wildcard = "*" in cors_origins

# CORS — allow frontend dev server and deployed production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if not is_wildcard else ["*"],
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trip_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Atlas API"}
