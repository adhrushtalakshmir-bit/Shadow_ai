import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=True)
    extracted_text = Column(Text, nullable=True)
    masked_text = Column(Text, nullable=True)
    risk_score = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.0)
    llm_response = Column(Text, nullable=True)
    model_used = Column(String, nullable=True)
    status = Column(String, default="completed") # processing, completed, failed
    detected_entities = Column(JSON, nullable=True) # list of dicts
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
