from pydantic import BaseModel, Field
from typing import List, Optional

class DetectRequest(BaseModel):
    prompt: str = Field(..., example="My PAN is ABCDE1234F and phone is 9876543210.")
    
class EntityConfig(BaseModel):
    entity_type: str
    mask_character: str = "*"
    reveal_last: int = 0

class MaskRequest(BaseModel):
    prompt: str = Field(..., example="My PAN is ABCDE1234F.")
    configs: Optional[List[EntityConfig]] = None

class ScanRequest(BaseModel):
    prompt: str = Field(..., example="Scan this for sensitive data.")

class DetectedEntity(BaseModel):
    category: str
    value: str
    start_index: int
    end_index: int
    mask_token: str

class DetectResponse(BaseModel):
    original_prompt: str
    sanitized_prompt: str
    risk_score: int
    detected_entities: List[DetectedEntity]
    is_safe: bool
