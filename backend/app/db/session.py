from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Fallback to sqlite for local dev if DATABASE_URL is not provided
raw_db_url = settings.DATABASE_URL or "sqlite+aiosqlite:///./shadow_ai_guard.db"

# SQLAlchemy async engines require postgresql+asyncpg:// instead of postgres:// or postgresql://
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_db_url.startswith("postgresql://"):
    raw_db_url = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DB_URL = raw_db_url

# Configure connection arguments (SSL required for Supabase/Postgres)
connect_args = {}
if "sqlite" in DB_URL:
    connect_args["check_same_thread"] = False
else:
    connect_args["ssl"] = True

engine = create_async_engine(
    DB_URL, 
    echo=False, 
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
