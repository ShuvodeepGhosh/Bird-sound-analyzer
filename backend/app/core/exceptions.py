from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("birdsense.exceptions")

class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

class BirdNetExecutionError(AppException):
    def __init__(self, detail: str = "BirdNET execution failed"):
        super().__init__(status_code=500, detail=detail)

class InvalidAudioError(AppException):
    def __init__(self, detail: str = "Invalid or unsupported audio file"):
        super().__init__(status_code=400, detail=detail)

class CsvParsingError(AppException):
    def __init__(self, detail: str = "Failed to parse BirdNET output"):
        super().__init__(status_code=500, detail=detail)

async def app_exception_handler(request: Request, exc: AppException):
    logger.error(f"AppException: {exc.detail} at {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)} at {request.url}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )
