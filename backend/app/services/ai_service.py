from app.services.detection.engine import engine

class AIService:
    """
    Service layer for AI operations.
    Connects to the detection engine for prompt analysis and sanitization.
    """
    def __init__(self):
        self.engine = engine

    async def analyze_prompt(self, prompt: str):
        """
        Analyzes and sanitizes a prompt before sending it to an LLM.
        """
        return self.engine.process_prompt(prompt)

ai_service = AIService()
