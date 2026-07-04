
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "BirdSense AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Optional DB config
    DATABASE_URL: str = "sqlite:///./birdsense.db"
    
    # Upload settings
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "output"
    TEMP_DIR: str = "temp"
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # BirdNET settings
    MIN_CONFIDENCE: float = 0.5
    DEFAULT_LATITUDE: float = -1.0 # Or default valid value, BirdNET uses -1 for unknown
    DEFAULT_LONGITUDE: float = -1.0
    BIRDNET_COMMAND: str = "birdnet-analyze"

    
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
