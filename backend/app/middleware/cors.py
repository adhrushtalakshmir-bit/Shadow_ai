from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def add_cors_middleware(app: FastAPI):
    """
    Adds CORS middleware to the FastAPI app allowing specified origins.
    """
    origins = settings.CORS_ORIGINS.copy()
    if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
        origins.append(settings.FRONTEND_URL)
        
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if origins else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
