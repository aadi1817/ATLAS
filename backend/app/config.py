from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/atlas"
    GEMINI_API_KEY: str = ""
    LLM_API_KEY: str = ""  # backwards compatibility fallback
    GEMINI_MODEL: str = "gemini-3.8-flash"  # "models/" prefix added automatically in service layer
    GOOGLE_MAPS_API_KEY: str = ""
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def api_key(self) -> str:
        return self.GEMINI_API_KEY or self.LLM_API_KEY

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
