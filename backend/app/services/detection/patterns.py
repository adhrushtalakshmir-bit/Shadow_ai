import re

# Dictionary of regex patterns for sensitive data detection
PATTERNS = {
    # Aadhaar Number: 12 digits, often with spaces, dashes, or OCR dots
    "AADHAAR": r"\b\d{4}[-\s\.]?\d{4}[-\s\.]?\d{4}\b",
    
    # PAN Card: 5 letters, 4 digits, 1 letter (allow OCR spaces)
    "PAN": r"\b[A-Z]{5}[-\s]?[0-9]{4}[-\s]?[A-Z]{1}\b",
    
    # UPI ID: string@bank
    "UPI": r"\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b",
    
    # Email Address
    "EMAIL": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    
    # Phone Number: 10 digits, optional country code (+91, etc.)
    "PHONE": r"\b(?:\+?\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}\b",
    
    # API Key: Generic heuristic for long alphanumeric strings (often 32+ chars)
    "API_KEY": r"\b(?:[A-Za-z0-9-_]{32,})\b",
    
    # Bank Account: 9 to 18 digits (allow OCR spaces)
    "BANK_ACCOUNT": r"\b(?:\d[-\s]?){8,17}\d\b",
    
    # Credit Card (Visa, MasterCard, etc.)
    "CREDIT_CARD": r"\b(?:\d[ -]*?){13,16}\b",
    
    # IFSC Code (Indian Bank Code)
    "IFSC": r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
    
    # JWT Token
    "JWT": r"\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b"
}

# Base risk scores for each category
RISK_WEIGHTS = {
    "AADHAAR": 90,
    "PAN": 85,
    "API_KEY": 95,
    "BANK_ACCOUNT": 80,
    "PHONE": 40,
    "EMAIL": 30,
    "UPI": 60,
    "CREDIT_CARD": 90,
    "IFSC": 50,
    "JWT": 95,
    "UNKNOWN": 10
}
