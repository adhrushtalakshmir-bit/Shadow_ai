from pydantic import BaseModel
from typing import List, Optional
from app.schemas.detect import DetectedEntity

class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int

class DetectedEntityWithBox(DetectedEntity):
    box: Optional[BoundingBox] = None

class OCRAnalyzeResponse(BaseModel):
    extracted_text: str
    sanitized_text: str
    risk_score: int
    confidence_score: float
    detected_entities: List[DetectedEntityWithBox]
    llm_response: str
