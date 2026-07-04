from pydantic import BaseModel, Field
from typing import List

class BirdDetection(BaseModel):
    common_name: str = Field(..., description="Common name of the detected bird")
    scientific_name: str = Field(..., description="Scientific name of the detected bird")
    confidence: float = Field(..., description="Confidence score from BirdNET (0.0 to 1.0)")
    start_time: float = Field(..., description="Start time of the detection in seconds")
    end_time: float = Field(..., description="End time of the detection in seconds")

class BirdAnalysisResponse(BaseModel):
    filename: str = Field(..., description="Original filename of the analyzed audio")
    duration_seconds: float = Field(..., description="Total duration of the audio in seconds")
    analysis_time_ms: int = Field(..., description="Time taken to run BirdNET analysis in milliseconds")
    detections: List[BirdDetection] = Field(default_factory=list, description="List of detected birds")
