import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from datetime import datetime
from app.db.base import Base

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String, nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
