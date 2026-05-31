from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    """
    return {
        "status": "online",
        "service": "Shadow AI Guard API",
        "version": "1.0.0"
    }
