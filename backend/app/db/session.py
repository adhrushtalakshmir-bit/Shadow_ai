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

logger.info(f"Database URL scheme: {DB_URL.split('://')[0] if '://' in DB_URL else 'unknown'}")

# Configure connection arguments
connect_args = {}
if "sqlite" in DB_URL:
    connect_args["check_same_thread"] = False
else:
    # asyncpg requires an ssl.SSLContext, not a boolean.
    # Use ssl="require" mode which asyncpg accepts as a string shorthand,
    # or create a proper SSLContext for Supabase/cloud PostgreSQL.
    import ssl as ssl_module
    ssl_ctx = ssl_module.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl_module.CERT_NONE
    connect_args["ssl"] = ssl_ctx

engine = create_async_engine(
    DB_URL, 
    echo=False, 
    connect_args=connect_args,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
