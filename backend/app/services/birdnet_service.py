import os
import csv
import time
import uuid
import shutil
import asyncio
import logging
from pathlib import Path
from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import InvalidAudioError, BirdNetExecutionError, CsvParsingError
from app.schemas.bird import BirdDetection, BirdAnalysisResponse

logger = logging.getLogger("birdsense.services.birdnet")

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".webm"}

class BirdNetService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.output_dir = Path(settings.OUTPUT_DIR)
        
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, filename: str, file_size: int | None) -> None:
        if not filename:
            raise InvalidAudioError("No filename provided")
        
        if file_size is not None:
            size_mb = file_size / (1024 * 1024)
            if size_mb > settings.MAX_UPLOAD_SIZE_MB:
                raise InvalidAudioError(f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB.")
                
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise InvalidAudioError(f"Unsupported audio format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    async def save_upload_file(self, upload_file: UploadFile, dest_path: Path) -> None:
        try:
            with dest_path.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
        except Exception as e:
            logger.error(f"Failed to save upload file: {str(e)}")
            raise InvalidAudioError("Could not save the uploaded file")

    async def analyze(self, file: UploadFile, lat: float | None = None, lon: float | None = None, denoise: bool = False) -> BirdAnalysisResponse:
        from datetime import datetime
        from birdnetlib import Recording
        from app.core.analyzer import get_analyzer

        logger.info(f"Upload started: {file.filename}, denoise: {denoise}")
        self.validate_file(file.filename, file.size)
        
        file_id = str(uuid.uuid4())
        ext = Path(file.filename).suffix
        
        temp_audio_path = self.upload_dir / f"{file_id}{ext}"
        
        await self.save_upload_file(file, temp_audio_path)
        logger.info(f"Upload completed: {temp_audio_path.name}")
        
        if denoise:
            logger.info("Running AI audio denoising...")
            try:
                import librosa
                import soundfile as sf
                import noisereduce as nr
                
                # Load audio
                y, sr = librosa.load(str(temp_audio_path), sr=None)
                # Denoise
                reduced_noise = nr.reduce_noise(y=y, sr=sr, stationary=True)
                # Write back (ensure we write as wav for best compatibility)
                if ext.lower() != '.wav':
                    ext = '.wav'
                    temp_audio_path = self.upload_dir / f"{file_id}{ext}"
                sf.write(str(temp_audio_path), reduced_noise, sr)
                logger.info("Denoising complete")
            except Exception as e:
                logger.error(f"Denoising failed, falling back to original: {e}")

        start_time = time.time()
        
        try:
            # Run inference using the pre-loaded global model
            analyzer = get_analyzer()
            
            def run_inference():
                # Use provided coordinates, otherwise fallback to defaults
                use_lat = lat if lat is not None else settings.DEFAULT_LATITUDE
                use_lon = lon if lon is not None else settings.DEFAULT_LONGITUDE
                # Only pass lat/lon if they are not the default -1.0 (which means unknown)
                # birdnetlib filters birds based on location, so passing -1.0, -1.0 will filter out almost everything
                kwargs = {
                    "min_conf": settings.MIN_CONFIDENCE,
                    "sensitivity": settings.SENSITIVITY
                }
                if use_lat != -1.0 and use_lon != -1.0:
                    kwargs["lat"] = use_lat
                    kwargs["lon"] = use_lon
                    kwargs["date"] = datetime.now()

                recording = Recording(
                    analyzer,
                    str(temp_audio_path),
                    **kwargs
                )
                recording.analyze()
                
                # Known non-bird noise classes in BirdNET
                NOISE_CLASSES = {
                    "Human vocal", "Human non-vocal", "Human whistling", "Human footsteps", 
                    "Engine", "Siren", "Noise", "Silence", "Wind", "Rain", "Water", 
                    "Dog", "Domestic dog", "Cat", "Domestic cat", "Vehicle", "Motor", 
                    "Fireworks", "Gunshot", "Thunder", "Environmental", "Background"
                }
                
                filtered_detections = []
                for d in recording.detections:
                    if d['confidence'] >= settings.MIN_CONFIDENCE:
                        # Filter out noise classes
                        if d['common_name'] not in NOISE_CLASSES and d['scientific_name'] not in NOISE_CLASSES:
                            filtered_detections.append(d)
                            
                return filtered_detections, recording.duration
            
            # Run the blocking analysis in a thread
            raw_detections, audio_duration = await asyncio.to_thread(run_inference)
            
            # Fetch extra info for each unique bird
            from app.services.bird_info_service import bird_info_service
            
            unique_species = list(set(det['scientific_name'] for det in raw_detections))
            info_tasks = {species: bird_info_service.get_bird_info(species) for species in unique_species}
            
            # Wait for all info to be fetched concurrently
            info_results = {}
            if unique_species:
                results = await asyncio.gather(*info_tasks.values())
                for species, result in zip(info_tasks.keys(), results):
                    info_results[species] = result
            
            detections = []
            for det in raw_detections:
                species = det['scientific_name']
                extra_info = info_results.get(species, {})
                
                detections.append(BirdDetection(
                    common_name=det['common_name'],
                    scientific_name=species,
                    confidence=det['confidence'],
                    start_time=det['start_time'],
                    end_time=det['end_time'],
                    image_url=extra_info.get("image_url"),
                    description=extra_info.get("description"),
                    order=extra_info.get("order"),
                    family=extra_info.get("family"),
                    gbif_taxon_key=extra_info.get("gbif_taxon_key"),
                    iucn_category=extra_info.get("iucn_category")
                ))
            
            analysis_time_ms = int((time.time() - start_time) * 1000)
            
            logger.info(f"Processing duration: {analysis_time_ms} ms, Number of detections: {len(detections)}")
            
            return BirdAnalysisResponse(
                filename=file.filename,
                duration_seconds=audio_duration,
                analysis_time_ms=analysis_time_ms,
                detections=detections
            )
            
        except Exception as e:
            logger.error(f"Error during analysis: {repr(e)}")
            raise BirdNetExecutionError(f"Unexpected error during analysis: {repr(e)}")
            
        finally:
            # Cleanup
            if temp_audio_path.exists():
                temp_audio_path.unlink()
            logger.info("Cleanup completed")
