import asyncio
from app.db.session import engine
from app.db.base import Base
from app.models.user import User
from app.models.scan import ScanHistory

async def init_db():
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Done!")

if __name__ == "__main__":
    asyncio.run(init_db())
