from fastapi import FastAPI
import uvicorn
import os

from app.core.config import settings
from app.core.logging import logger
from app.middleware.cors import add_cors_middleware
from app.api.routes import health, detect, chat, ocr, history, auth
from app.db.session import engine
from app.db.base import Base
import app.models.scan  # Ensure models are imported for create_all
import app.models.user
import app.models.analytics
import app.models.chat_history

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Shadow AI Guard",
)

# Setup Middlewares
add_cors_middleware(app)

# Include API Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(detect.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(ocr.router, prefix=settings.API_V1_STR + "/ocr")
app.include_router(history.router, prefix=settings.API_V1_STR + "/history")
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth")

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import traceback

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    logger.error(f"Validation error: {exc.errors()} | Body: {body.decode(errors='ignore')}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body.decode(errors='ignore')}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught: {exc}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Shadow AI Guard API...")
    # Initialize database tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created/verified successfully.")
    except Exception as e:
        logger.error(f"Database initialization error (non-fatal, will retry on first request): {e}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Shadow AI Guard API...")

@app.get("/", tags=["Root"])
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

if __name__ == "__main__":
    # This allows running the file directly with `python main.py`
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=int(os.environ.get("PORT", 8000)), 
        reload=True
    )
