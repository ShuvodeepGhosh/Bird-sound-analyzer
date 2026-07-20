from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import Optional
from app.schemas.bird import BirdAnalysisResponse
from app.services.birdnet_service import BirdNetService

router = APIRouter()

def get_birdnet_service() -> BirdNetService:
    return BirdNetService()

@router.post("/", response_model=BirdAnalysisResponse)
async def analyze_audio(
    file: UploadFile = File(...),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
    denoise: Optional[bool] = Form(False),
    service: BirdNetService = Depends(get_birdnet_service)
):
    """
    Analyze an uploaded audio file using BirdNET.
    """
    return await service.analyze(file, lat, lon, denoise)
