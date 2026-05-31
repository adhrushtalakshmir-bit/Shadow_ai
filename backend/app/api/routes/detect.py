from app.schemas.detect import DetectRequest, DetectResponse, MaskRequest, ScanRequest, DetectedEntity
from app.services.detection.engine import engine
from app.db.session import AsyncSessionLocal
from app.models.scan import ScanHistory
from app.models.user import User
from app.api.deps import get_current_user
from fastapi import APIRouter, HTTPException, Depends
from app.core.logging import logger

router = APIRouter()

@router.post("/detect", response_model=DetectResponse, tags=["Detection"])
async def detect_sensitive_data(
    request: DetectRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Full pipeline: Scans the prompt, calculates a risk score, and returns the sanitized text.
    """
    try:
        logger.info("Processing /detect request")
        result = engine.process_prompt(request.prompt)
        
        try:
            async with AsyncSessionLocal() as session:
                db_scan = ScanHistory(
                    user_id=current_user.id,
                    filename=None,
                    extracted_text=request.prompt,
                    masked_text=result["sanitized_prompt"],
                    risk_score=result["risk_score"],
                    confidence_score=100.0,
                    llm_response=None,
                    model_used=None,
                    status="completed",
                    detected_entities=[e.dict() for e in result["detected_entities"]]
                )
                session.add(db_scan)
                await session.commit()
        except Exception as db_err:
            logger.error(f"Failed to save detect history to DB: {db_err}")
            
        return DetectResponse(**result)
    except Exception as e:
        logger.error(f"Error in /detect: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during detection")

@router.post("/scan", response_model=list[DetectedEntity], tags=["Detection"])
async def scan_only(
    request: ScanRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Scans the prompt and returns only the detected entities without masking.
    """
    try:
        logger.info("Processing /scan request")
        entities = engine.scan(request.prompt)
        return entities
    except Exception as e:
        logger.error(f"Error in /scan: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during scan")

@router.post("/mask", tags=["Detection"])
async def mask_only(
    request: MaskRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Scans and masks the prompt, returning only the masked string.
    """
    try:
        logger.info("Processing /mask request")
        entities = engine.scan(request.prompt)
        sanitized = engine.mask_text(request.prompt, entities)
        return {"sanitized_prompt": sanitized}
    except Exception as e:
        logger.error(f"Error in /mask: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during masking")
