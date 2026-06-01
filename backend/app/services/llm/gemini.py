import google.generativeai as genai
from app.core.config import settings
from app.core.logging import logger

class GeminiService:
    """
    Service to interact with Google's Generative AI (Gemini).
    Uses lazy initialization to avoid blocking server startup.
    """
    def __init__(self):
        self.model = None
        self.is_configured = False
        self._initialized = False

        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.is_configured = True
                logger.info("Gemini API key configured. Model will be initialized on first request.")
            except Exception as e:
                logger.error(f"Failed to configure Gemini API key: {e}")
                self.is_configured = False
        else:
            logger.warning("GEMINI_API_KEY is not set in the environment.")

    def _lazy_init_model(self):
        """Initialize the model on first use, not at import time."""
        if self._initialized:
            return
        self._initialized = True
        
        try:
            model_name = self._get_latest_supported_model()
            logger.info(f"Dynamically selected Gemini model: {model_name}")
            self.model = genai.GenerativeModel(model_name)
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {e}")
            # Use hardcoded fallback
            self.model = genai.GenerativeModel('gemini-1.5-flash')

    def _get_latest_supported_model(self) -> str:
        """
        Queries the Gemini API for available models and selects the latest
        supported 'flash' model for text generation (avoiding deprecated/vision models).
        """
        fallback_model = 'gemini-1.5-flash'
        try:
            available_models = []
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    name = m.name.replace('models/', '')
                    # Filter out older bison models, vision-specific models, and experimental models
                    if 'gemini' in name and 'vision' not in name and 'exp' not in name and 'latest' not in name:
                        available_models.append(name)
            
            if available_models:
                # Prefer the latest flash models for fast chat response
                flash_models = [m for m in available_models if 'flash' in m]
                if flash_models:
                    return sorted(flash_models)[-1]
                return sorted(available_models)[-1]
                
            return fallback_model
        except Exception as e:
            logger.warning(f"Could not fetch dynamic model list, using fallback. Error: {e}")
            return fallback_model

    async def generate_response(self, prompt: str) -> str:
        """
        Sends the sanitized prompt to Gemini and returns the response.
        """
        if not self.is_configured:
            return "Error: Gemini API key is missing. Shadow AI Guard has masked your data, but cannot process the response."
        
        # Lazy init model on first call
        self._lazy_init_model()
            
        try:
            # The SDK supports async via generate_content_async
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return f"Error: Failed to fetch response from Gemini. ({str(e)})"

gemini_service = GeminiService()
