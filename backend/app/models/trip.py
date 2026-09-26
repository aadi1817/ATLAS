from sqlalchemy import Column, String, Integer, JSON, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    destination = Column(String(255), nullable=True)
    travel_input = Column(Text, nullable=False)
    preferences_json = Column(JSON, nullable=False)
    generated_trip_json = Column(JSON, nullable=True)
    status = Column(String(50), default="pending")  # pending | generated | failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
