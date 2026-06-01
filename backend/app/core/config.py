from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Shadow AI Guard API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment variables
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str | None = None
    FRONTEND_URL: str | None = None
    
    # Auth
    SECRET_KEY: str = "a_very_secret_key_for_shadow_ai_guard_123!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # CORS setup — includes production frontend by default
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # React default
        "https://shadow-ai-guard.vercel.app",  # Production frontend
    ]
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
