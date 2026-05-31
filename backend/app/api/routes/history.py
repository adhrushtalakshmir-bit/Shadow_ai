from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.db.session import get_db
from app.models.scan import ScanHistory
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]], tags=["History"])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all scan history records for the current user."""
    result = await db.execute(
        select(ScanHistory)
        .where(ScanHistory.user_id == current_user.id)
        .order_by(ScanHistory.timestamp.desc())
    )
    records = result.scalars().all()
    
    # We return dictionaries to easily handle the JSON detected_entities
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "extracted_text": r.extracted_text,
            "masked_text": r.masked_text,
            "risk_score": r.risk_score,
            "confidence_score": r.confidence_score,
            "llm_response": r.llm_response,
            "model_used": r.model_used,
            "status": r.status,
            "timestamp": r.timestamp,
            "detected_entities": r.detected_entities
        }
        for r in records
    ]

@router.get("/{scan_id}", response_model=Dict[str, Any], tags=["History"])
async def get_history_by_id(
    scan_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific scan by ID"""
    result = await db.execute(
        select(ScanHistory)
        .where(ScanHistory.id == scan_id, ScanHistory.user_id == current_user.id)
    )
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Scan history not found")
        
    return {
        "id": record.id,
        "filename": record.filename,
        "extracted_text": record.extracted_text,
        "masked_text": record.masked_text,
        "risk_score": record.risk_score,
        "confidence_score": record.confidence_score,
        "llm_response": record.llm_response,
        "model_used": record.model_used,
        "status": record.status,
        "timestamp": record.timestamp,
        "detected_entities": record.detected_entities
    }

@router.delete("/{scan_id}", tags=["History"])
async def delete_history(
    scan_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a scan record"""
    result = await db.execute(
        select(ScanHistory)
        .where(ScanHistory.id == scan_id, ScanHistory.user_id == current_user.id)
    )
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Scan history not found")
        
    await db.delete(record)
    await db.commit()
    
    return {"status": "success", "message": "Scan deleted"}
