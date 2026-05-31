import logging
import sys

def setup_logging():
    """
    Configures standard logging for the application.
    Outputs to stdout with a simple, readable format.
    """
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    
    logger = logging.getLogger("shadow_ai_guard")
    return logger

logger = setup_logging()
