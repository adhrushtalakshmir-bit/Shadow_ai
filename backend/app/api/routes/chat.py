from app.schemas.chat import ChatRequest, ChatResponse
from app.services.detection.engine import engine
from app.services.llm.router import llm_router
from app.db.session import AsyncSessionLocal
from app.models.scan import ScanHistory
from app.models.user import User
from app.api.deps import get_current_user
from fastapi import APIRouter, HTTPException, Depends
from app.core.logging import logger

router = APIRouter()

@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_with_gemini(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Workflow:
    1. Scan and mask sensitive data using Detection Engine
    2. Send the sanitized prompt to the chosen LLM
    3. Return the AI response along with detection metadata
    """
    try:
        logger.info(f"Processing /chat request for model {request.model}")
        
        # 1. Run detection engine
        detection_result = engine.process_prompt(request.text)
        sanitized_prompt = detection_result["sanitized_prompt"]
        risk_score = detection_result["risk_score"]
        entities = detection_result["detected_entities"]
        
        # 2. Call LLM Router
        llm_response = await llm_router.route_prompt(sanitized_prompt, request.model)
        
        # 3. Save History asynchronously
        try:
            async with AsyncSessionLocal() as session:
                db_scan = ScanHistory(
                    user_id=current_user.id,
                    filename=None,
                    extracted_text=request.text,
                    masked_text=sanitized_prompt,
                    risk_score=risk_score,
                    confidence_score=100.0, # 100% since it's direct text input
                    llm_response=llm_response,
                    model_used=request.model,
                    detected_entities=[e.dict() for e in entities]
                )
                session.add(db_scan)
                await session.commit()
        except Exception as db_err:
            logger.error(f"Failed to save chat history to DB: {db_err}")
            
        # 4. Return full payload
        return ChatResponse(
            masked_text=sanitized_prompt,
            risk_score=risk_score,
            entities=entities,
            llm_response=llm_response
        )
        
    except Exception as e:
        logger.error(f"Error in /chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during chat processing")
