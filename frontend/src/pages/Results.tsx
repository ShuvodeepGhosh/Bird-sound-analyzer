import React, { useEffect } from 'react';
import { Container, Button, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultSummary from '../components/ResultSummary';
import DetectionList from '../components/DetectionList';
import type { BirdAnalysisResponse } from '../types';

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as BirdAnalysisResponse;

  useEffect(() => {
    if (!result) {
      navigate('/upload');
    }
  }, [result, navigate]);

  if (!result) return null;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button 
        onClick={() => navigate('/upload')}
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        &larr; Analyze Another File
      </Button>
      
      <ResultSummary result={result} />
      <DetectionList detections={result.detections} />
    </Container>
  );
};

export default Results;
