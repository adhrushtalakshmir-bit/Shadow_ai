from app.services.llm.gemini import gemini_service
from app.core.logging import logger

class LLMRouter:
    """
    Routes the sanitized prompt to the chosen LLM backend.
    """
    async def route_prompt(self, prompt: str, model: str) -> str:
        logger.info(f"Routing prompt to model: {model}")
        
        # Ollama has been removed as per specification. All LLM requests route to Gemini.
        return await gemini_service.generate_response(prompt)

llm_router = LLMRouter()

