import logging
from birdnetlib.analyzer import Analyzer

logger = logging.getLogger("birdsense.core.analyzer")

class BirdNetAnalyzerSingleton:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            logger.info("Initializing global BirdNET Analyzer (loading model into memory...)")
            cls._instance = Analyzer()
        return cls._instance

def get_analyzer() -> Analyzer:
    """Returns the singleton instance of the BirdNET Analyzer."""
    return BirdNetAnalyzerSingleton.get_instance()
