import re
from typing import List, Dict, Any, Tuple
from app.services.detection.patterns import PATTERNS, RISK_WEIGHTS
from app.schemas.detect import DetectedEntity
from app.core.logging import logger

try:
    from transformers import pipeline
    # Lightweight NER model for Person, Organization, Location detection
    ner_pipeline = pipeline("ner", model="dslim/distilbert-NER", aggregation_strategy="simple")
    logger.info("Loaded AI NER Pipeline successfully.")
except ImportError:
    ner_pipeline = None
    logger.warning("Transformers not found. NER disabled.")
except Exception as e:
    ner_pipeline = None
    logger.error(f"Error loading NER pipeline: {e}")

class DetectionEngine:
    """
    Core engine for detecting sensitive information using Regex,
    calculating risk scores, and generating sanitized prompts.
    """
    
    def __init__(self):
        # Pre-compile regex patterns for performance
        self.compiled_patterns = {
            category: re.compile(pattern, re.IGNORECASE)
            for category, pattern in PATTERNS.items()
        }

    def scan(self, text: str) -> List[DetectedEntity]:
        """
        Scans text and returns all detected entities.
        """
        entities = []
        
        for category, regex in self.compiled_patterns.items():
            for match in regex.finditer(text):
                value = match.group()
                start_index = match.start()
                end_index = match.end()
                
                # Check for overlapping entities to prevent double masking
                # (e.g. Phone number matched as Bank Account)
                is_overlap = any(
                    (start_index >= e.start_index and start_index < e.end_index) or
                    (end_index > e.start_index and end_index <= e.end_index)
                    for e in entities
                )
                
                if not is_overlap:
                    # Create a unique mask token
                    mask_token = f"[{category}_ID_{len(entities) + 1}]"
                    
                    entities.append(
                        DetectedEntity(
                            category=category,
                            value=value,
                            start_index=start_index,
                            end_index=end_index,
                            mask_token=mask_token
                        )
                    )
        
        # 2. AI NER Detection
        if ner_pipeline:
            try:
                ner_results = ner_pipeline(text)
                for res in ner_results:
                    category = res.get('entity_group', 'UNKNOWN')
                    # We are mostly interested in Persons, Organizations, Locations
                    if category in ['PER', 'ORG', 'LOC']:
                        value = res['word']
                        start_index = res['start']
                        end_index = res['end']
                        score = float(res.get('score', 0.0))
                        
                        if score > 0.8: # Only trust high confidence NER
                            is_overlap = any(
                                (start_index >= e.start_index and start_index < e.end_index) or
                                (end_index > e.start_index and end_index <= e.end_index)
                                for e in entities
                            )
                            if not is_overlap:
                                mask_token = f"[{category}_{len(entities) + 1}]"
                                entities.append(
                                    DetectedEntity(
                                        category=category,
                                        value=value,
                                        start_index=start_index,
                                        end_index=end_index,
                                        mask_token=mask_token
                                    )
                                )
            except Exception as e:
                logger.error(f"NER processing failed: {e}")
        
        # Sort entities by start_index descending for safe replacement
        entities.sort(key=lambda x: x.start_index, reverse=True)
        return entities

    def calculate_risk(self, entities: List[DetectedEntity]) -> int:
        """
        Calculates a risk score between 0 and 100 based on detected entities.
        """
        if not entities:
            return 0
            
        total_risk = sum(RISK_WEIGHTS.get(e.category, RISK_WEIGHTS["UNKNOWN"]) for e in entities)
        
        # Cap at 100
        return min(100, total_risk)

    def mask_text(self, text: str, entities: List[DetectedEntity]) -> str:
        """
        Replaces sensitive data in the text with mask tokens.
        Assumes entities are sorted by start_index descending to prevent offset shifting.
        """
        sanitized = text
        for entity in entities:
            sanitized = sanitized[:entity.start_index] + entity.mask_token + sanitized[entity.end_index:]
        return sanitized

    def process_prompt(self, text: str) -> Dict[str, Any]:
        """
        Main pipeline: Scans, scores, and masks the input text.
        """
        entities = self.scan(text)
        risk_score = self.calculate_risk(entities)
        sanitized_text = self.mask_text(text, entities)
        
        return {
            "original_prompt": text,
            "sanitized_prompt": sanitized_text,
            "risk_score": risk_score,
            "detected_entities": entities,
            "is_safe": risk_score < 50
        }

# Singleton instance
engine = DetectionEngine()
