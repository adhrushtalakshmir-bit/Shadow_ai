from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserResponse, Token, UserLogin
from app.api.deps import get_current_user

router = APIRouter()

from app.core.logging import logger

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    """
    logger.info(f"Signup started for email: {user_in.email}")
    try:
        logger.info("Executing select query")
        result = await db.execute(select(User).where(User.email == user_in.email))
        user = result.scalars().first()
        logger.info(f"Select query complete, user found: {bool(user)}")
        
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )
        
        logger.info("Hashing password")
        hashed_password = get_password_hash(user_in.password)
        logger.info("Password hashed")
        
        db_user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=hashed_password,
        )
        logger.info("Adding user to session")
        db.add(db_user)
        logger.info("Committing to DB")
        await db.commit()
        logger.info("Refreshing user")
        await db.refresh(db_user)
        logger.info("Signup complete")
        
        return db_user
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}")
        raise e

@router.post("/login", response_model=Token, tags=["Auth"])
async def login(form_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    OAuth2 compatible token login, get an access token for future requests.
    Supports JSON body login.
    """
    result = await db.execute(select(User).where(User.email == form_data.email))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse, tags=["Auth"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.
    """
    return current_user

@router.post("/logout", tags=["Auth"])
async def logout():
    """
    Logout endpoint. Clears user session on client side.
    """
    return {"message": "Logged out successfully"}

