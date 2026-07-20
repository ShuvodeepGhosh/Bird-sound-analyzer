import React, { useEffect, useState } from 'react';
import { Container, Button, Typography, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultSummary from '../components/ResultSummary';
import DetectionList from '../components/DetectionList';
import Waveform from '../components/WaveformPlayer/Waveform';
import { useBirdHistory } from '../hooks/useBirdHistory';
import type { BirdAnalysisResponse } from '../types';

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as BirdAnalysisResponse;
  const audioUrl = location.state?.audioUrl as string | undefined;
  
  const { addDetections } = useBirdHistory();

  const [activeDetectionIndex, setActiveDetectionIndex] = useState<number | null>(null);
  const [playTrigger, setPlayTrigger] = useState<number>(0);

  const handleDetectionSelect = (index: number | null) => {
    setActiveDetectionIndex(index);
    if (index !== null) {
      setPlayTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!result) {
      navigate('/upload');
    } else if (result.detections && result.detections.length > 0) {
      addDetections(result.detections);
    }
  }, [result, navigate, addDetections]);

  if (!result) return null;

  return (
    <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 4, md: 8 } }}>
      <Button
        onClick={() => navigate('/upload')}
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        &larr; Analyze Another File
      </Button>

      <ResultSummary result={result} />

      {audioUrl ? (
        <Waveform
          audioUrl={audioUrl}
          detections={result.detections}
          activeDetectionIndex={activeDetectionIndex}
          onDetectionSelect={handleDetectionSelect}
          playTrigger={playTrigger}
        />
      ) : (
        <Box sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText', borderRadius: 1, mb: 4 }}>
          <Typography variant="body2">Audio playback is unavailable because the audio file was not provided. Please re-upload.</Typography>
        </Box>
      )}

      <DetectionList
        detections={result.detections}
        activeDetectionIndex={activeDetectionIndex}
        onDetectionSelect={handleDetectionSelect}
      />
    </Container>
  );
};

export default Results;
