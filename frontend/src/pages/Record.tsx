import React, { useState } from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import RecordCard from '../components/RecordCard';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorDialog from '../components/ErrorDialog';
import { birdApi } from '../services/birdApi';

const Record: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: birdApi.analyzeAudio,
    onSuccess: (data) => {
      navigate('/results', { state: { result: data } });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'An unexpected error occurred during analysis.';
      setErrorMsg(msg);
    }
  });

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <RecordCard
        selectedFile={file}
        onRecordingComplete={setFile}
        lat={lat}
        lon={lon}
        onLocationUpdate={(newLat, newLon) => {
          setLat(newLat);
          setLon(newLon);
        }}
        onAnalyze={() => {
          if (file) mutation.mutate({ file, lat, lon });
        }}
        disabled={mutation.isPending}
      />
      
      <LoadingOverlay open={mutation.isPending} />
      
      <ErrorDialog
        open={!!errorMsg}
        message={errorMsg}
        onClose={() => setErrorMsg('')}
      />
    </Container>
  );
};

export default Record;
