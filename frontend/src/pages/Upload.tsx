import React, { useState } from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import UploadCard from '../components/UploadCard';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorDialog from '../components/ErrorDialog';
import { birdApi } from '../services/birdApi';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const [denoise, setDenoise] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: birdApi.analyzeAudio,
    onSuccess: (data) => {
      let audioUrl = '';
      if (file) {
        audioUrl = URL.createObjectURL(file);
      }
      navigate('/results', { state: { result: data, audioUrl } });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'An unexpected error occurred during analysis.';
      setErrorMsg(msg);
    }
  });

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <UploadCard
        selectedFile={file}
        onFileSelect={setFile}
        onClear={() => setFile(null)}
        lat={lat}
        lon={lon}
        onLocationUpdate={(newLat, newLon) => {
          setLat(newLat);
          setLon(newLon);
        }}
        denoise={denoise}
        onDenoiseChange={setDenoise}
        onAnalyze={() => {
          if (file) mutation.mutate({ file, lat, lon, denoise });
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

export default Upload;
