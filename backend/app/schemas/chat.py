from pydantic import BaseModel, Field
from typing import List
from app.schemas.detect import DetectedEntity

class ChatRequest(BaseModel):
    text: str = Field(..., example="What is my PAN ABCDE1234F?")
    model: str = Field("gemini", example="gemini")

class ChatResponse(BaseModel):
    masked_text: str
    risk_score: int
    entities: List[DetectedEntity]
    llm_response: str
