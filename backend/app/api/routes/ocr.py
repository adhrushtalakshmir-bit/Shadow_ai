import io
import pytesseract
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from pytesseract import Output
import fitz  # PyMuPDF

from app.schemas.detect import DetectResponse
from app.schemas.ocr import OCRAnalyzeResponse, BoundingBox, DetectedEntityWithBox
from app.services.detection.engine import engine
from app.services.ocr.preprocessor import preprocessor
from app.services.llm.router import llm_router
from app.db.session import AsyncSessionLocal
from app.models.scan import ScanHistory
from app.models.user import User
from app.api.deps import get_current_user
from app.core.logging import logger

import os

router = APIRouter()

# Set Tesseract OCR path for Windows, rely on PATH for Linux (Railway)
if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@router.post("/scan", response_model=DetectResponse, tags=["OCR"])
async def ocr_scan(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Legacy independent OCR scan route"""
    content = await file.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    result = engine.process_prompt(text)
    return DetectResponse(**result)


@router.post("/analyze", response_model=OCRAnalyzeResponse, tags=["OCR"])
async def ocr_analyze(
    file: UploadFile = File(...), 
    prompt: str = Form(...), 
    model: str = Form("gemini-1.5-flash"),
    current_user: User = Depends(get_current_user)
):
    """
    Combined workflow: OCR + Preprocessing + NER Detection + LLM Analysis
    """
    logger.info(f"Received OCR analyze request for file: {file.filename}")
    
    extracted_text = ""
    confidence_score = 0.0
    ocr_data = None
    
    try:
        content = await file.read()
        
        # Explicit file size check (approximate max 10MB)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
            
        filename_lower = file.filename.lower()
        
        if filename_lower.endswith('.pdf') or file.content_type == 'application/pdf':
            logger.info("Processing PDF file...")
            pdf_document = fitz.open(stream=content, filetype="pdf")
            extracted_text = ""
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                text = pytesseract.image_to_string(img)
                extracted_text += text + "\n"
        elif filename_lower.endswith(('.png', '.jpg', '.jpeg')) or file.content_type in ['image/png', 'image/jpeg']:
            logger.info("Processing Image file with OpenCV Preprocessing...")
            img = Image.open(io.BytesIO(content))
            
            # Preprocess
            img = preprocessor.preprocess_for_ocr(img)
            
            # Extract data
            ocr_data = pytesseract.image_to_data(img, output_type=Output.DICT)
            
            confidences = []
            for i in range(len(ocr_data['text'])):
                word = ocr_data['text'][i].strip()
                conf = int(ocr_data['conf'][i])
                if conf > -1 and word:
                    extracted_text += word + " "
                    confidences.append(conf)
            
            extracted_text = extracted_text.strip()
            confidence_score = sum(confidences) / len(confidences) if confidences else 0.0
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
            
        if not extracted_text:
            extracted_text = "No text could be extracted."
            
        # 1. Detect & Sanitize
        detect_result = engine.process_prompt(extracted_text)
        
        # 2. Map Bounding Boxes
        entities_with_boxes = []
        for e in detect_result["detected_entities"]:
            box = None
            if ocr_data:
                for i in range(len(ocr_data['text'])):
                    word = ocr_data['text'][i]
                    # If part of the sensitive value is in this word
                    if word and word in e.value and int(ocr_data['conf'][i]) > -1:
                        # Divide by 2 because we resized by fx=2, fy=2 in preprocessing
                        box = BoundingBox(
                            x=ocr_data['left'][i] // 2,
                            y=ocr_data['top'][i] // 2,
                            w=ocr_data['width'][i] // 2,
                            h=ocr_data['height'][i] // 2
                        )
                        break
            
            entities_with_boxes.append(DetectedEntityWithBox(
                category=e.category,
                value=e.value,
                start_index=e.start_index,
                end_index=e.end_index,
                mask_token=e.mask_token,
                box=box
            ))
            
        # 3. LLM Request
        llm_prompt = f"User Question:\n{prompt}\n\nOCR Extracted Text:\n{detect_result['sanitized_prompt']}"
        llm_response = await llm_router.route_prompt(llm_prompt, model)
        
        # 4. Save History asynchronously
        try:
            async with AsyncSessionLocal() as session:
                db_scan = ScanHistory(
                    user_id=current_user.id,
                    filename=file.filename,
                    extracted_text=extracted_text,
                    masked_text=detect_result["sanitized_prompt"],
                    risk_score=detect_result["risk_score"],
                    confidence_score=confidence_score,
                    llm_response=llm_response,
                    model_used=model,
                    detected_entities=[e.dict() for e in entities_with_boxes]
                )
                session.add(db_scan)
                await session.commit()
        except Exception as db_err:
            logger.error(f"Failed to save history to DB: {db_err}")

        return OCRAnalyzeResponse(
            extracted_text=extracted_text,
            sanitized_text=detect_result["sanitized_prompt"],
            risk_score=detect_result["risk_score"],
            confidence_score=confidence_score,
            detected_entities=entities_with_boxes,
            llm_response=llm_response
        )
        
    except Exception as e:
        logger.error(f"Error in OCR analyze: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
