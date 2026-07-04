import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from pathlib import Path
from fastapi import UploadFile
import io

from app.services.birdnet_service import BirdNetService
from app.core.exceptions import InvalidAudioError, BirdNetExecutionError, CsvParsingError
from app.schemas.bird import BirdAnalysisResponse

@pytest.fixture
def service():
    return BirdNetService()

def test_validate_file_invalid_extension(service):
    with pytest.raises(InvalidAudioError) as exc:
        service.validate_file("test.txt", 1000)
    assert "Unsupported audio format" in str(exc.value)

def test_validate_file_size_limit(service):
    with pytest.raises(InvalidAudioError) as exc:
        service.validate_file("test.wav", 20 * 1024 * 1024) # 20MB > 10MB
    assert "File too large" in str(exc.value)

@pytest.mark.asyncio
async def test_run_birdnet_success(service):
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate.return_value = (b"", b"")
        mock_exec.return_value = mock_process
        
        await service.run_birdnet(Path("in.wav"), Path("out.csv"))
        mock_exec.assert_called_once()

@pytest.mark.asyncio
async def test_run_birdnet_failure(service):
    with patch("asyncio.create_subprocess_exec", new_callable=AsyncMock) as mock_exec:
        mock_process = AsyncMock()
        mock_process.returncode = 1
        mock_process.communicate.return_value = (b"", b"Some error")
        mock_exec.return_value = mock_process
        
        with pytest.raises(BirdNetExecutionError) as exc:
            await service.run_birdnet(Path("in.wav"), Path("out.csv"))
        assert "BirdNET analysis failed" in str(exc.value)

def test_parse_results_missing_file(service):
    with pytest.raises(CsvParsingError) as exc:
        service.parse_results(Path("nonexistent.csv"))
    assert "Output CSV not generated" in str(exc.value)

def test_parse_results_valid_csv(service, tmp_path):
    out_file = tmp_path / "valid.csv"
    out_file.write_text("Start (s);End (s);Scientific name;Common name;Confidence\n0.0;3.0;Turdus merula;Common Blackbird;0.98\n")
    
    detections = service.parse_results(out_file)
    assert len(detections) == 1
    assert detections[0].common_name == "Common Blackbird"
    assert detections[0].confidence == 0.98

def test_parse_results_malformed_csv(service, tmp_path):
    out_file = tmp_path / "malformed.csv"
    out_file.write_text("Invalid,Header,Row\nRandom;Data")
    
    # It might parse it incorrectly or throw CsvParsingError.
    # In our implementation, DictReader won't crash but will get bad keys. 
    # It sets 'Unknown' for common_name and float(None) might throw.
    with pytest.raises(CsvParsingError):
        service.parse_results(out_file)

@pytest.mark.asyncio
async def test_analyze_cleanup(service, tmp_path):
    service.upload_dir = tmp_path / "uploads"
    service.output_dir = tmp_path / "output"
    service.upload_dir.mkdir()
    service.output_dir.mkdir()

    file_content = b"fake audio data"
    upload_file = UploadFile(filename="test.wav", file=io.BytesIO(file_content))
    upload_file.size = len(file_content)
    
    # Mock run_birdnet to just create the output file
    async def mock_run(in_path, out_path):
        out_path.write_text("Start (s);End (s);Scientific name;Common name;Confidence\n0.0;3.0;Bird;Bird;0.9\n")
        
    with patch.object(service, "run_birdnet", new_callable=AsyncMock, side_effect=mock_run):
        resp = await service.analyze(upload_file)
        
        assert isinstance(resp, BirdAnalysisResponse)
        assert len(resp.detections) == 1
        
        # Verify cleanup
        upload_files = list(service.upload_dir.iterdir())
        output_files = list(service.output_dir.iterdir())
        assert len(upload_files) == 0
        assert len(output_files) == 0

@pytest.mark.asyncio
async def test_analyze_cleanup_on_error(service, tmp_path):
    service.upload_dir = tmp_path / "uploads"
    service.output_dir = tmp_path / "output"
    service.upload_dir.mkdir()
    service.output_dir.mkdir()

    file_content = b"fake audio data"
    upload_file = UploadFile(filename="test.wav", file=io.BytesIO(file_content))
    upload_file.size = len(file_content)
    
    # Mock run_birdnet to raise error after creating input file
    async def mock_run(in_path, out_path):
        raise BirdNetExecutionError("crash")
        
    with patch.object(service, "run_birdnet", new_callable=AsyncMock, side_effect=mock_run):
        with pytest.raises(BirdNetExecutionError):
            await service.analyze(upload_file)
        
        # Verify cleanup still ran
        upload_files = list(service.upload_dir.iterdir())
        assert len(upload_files) == 0
