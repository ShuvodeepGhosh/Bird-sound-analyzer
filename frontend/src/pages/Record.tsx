import React, { useState, useMemo } from 'react';
import { Container, Box, Typography, Button, IconButton, Chip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import LiveWaveform from '../components/LiveWaveform';
import CurrentDetection from '../components/CurrentDetection';
import DetectionList from '../components/DetectionList';
import ErrorDialog from '../components/ErrorDialog';
import { birdApi } from '../services/birdApi';
import { useLiveRecording } from '../hooks/useLiveRecording';
import type { BirdDetection } from '../types';

const Record: React.FC = () => {
  const [denoise, setDenoise] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [liveDetections, setLiveDetections] = useState<BirdDetection[]>([]);
  const [activeDetectionIndex, setActiveDetectionIndex] = useState<number | null>(null);

  const handleChunkReady = async (chunkFile: File, offset: number) => {
    try {
      const data = await birdApi.analyzeAudio({ file: chunkFile, denoise });

      const adjustedDetections = data.detections.map(d => ({
        ...d,
        start_time: d.start_time + offset,
        end_time: d.end_time + offset
      }));

      if (adjustedDetections.length > 0) {
        setLiveDetections(prev => [...prev, ...adjustedDetections]);
      }
    } catch (error) {
      console.error("Live chunk analysis failed:", error);
    }
  };

  const { isRecording, recordingTime, stream, startRecording, stopRecording } = useLiveRecording(handleChunkReady);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const currentDetection = useMemo(() => {
    if (activeDetectionIndex !== null && liveDetections[activeDetectionIndex]) {
      return liveDetections[activeDetectionIndex];
    }
    if (liveDetections.length > 0) {
      // Find the most recent one (highest start_time)
      return liveDetections.reduce((prev, current) => (prev.start_time > current.start_time) ? prev : current);
    }
    return null;
  }, [liveDetections, activeDetectionIndex]);

  const uniqueSpeciesCount = useMemo(() => {
    return new Set(liveDetections.map(d => d.scientific_name)).size;
  }, [liveDetections]);

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4, lg: 8 } }}>
      {/* Live Monitoring Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isRecording ? (
            <IconButton color="error" onClick={stopRecording} sx={{ bgcolor: 'rgba(211,47,47,0.1)', '&:hover': { bgcolor: 'rgba(211,47,47,0.2)' } }}>
              <StopIcon />
            </IconButton>
          ) : (
            <IconButton color="secondary" onClick={startRecording} sx={{ bgcolor: 'rgba(216,243,220,0.1)', '&:hover': { bgcolor: 'rgba(216,243,220,0.2)' } }}>
              <MicIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {isRecording && <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main', animation: 'pulse-glow-error 2s infinite' }} />}
              {isRecording ? 'LIVE' : 'Ready'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isRecording ? 'Recording from Microphone' : 'Start recording to detect bird species'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
            {formatTime(recordingTime)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Session Time
          </Typography>
        </Box>
      </Box>

      {/* Session Summary / Empty State */}
      {!isRecording && liveDetections.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Typography variant="h1" sx={{ mb: 2 }}>🎤</Typography>
          <Typography variant="h5" gutterBottom>Ready to Start Live Monitoring</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Start recording to detect bird species in real time.</Typography>
          <Button variant="contained" color="secondary" size="large" onClick={startRecording} startIcon={<MicIcon />}>
            Start Recording
          </Button>
        </Box>
      ) : (
        <>
          {/* Full Width Live Waveform */}
          <Box sx={{ mb: 4 }}>
            <LiveWaveform
              stream={stream}
              isRecording={isRecording}
              detections={liveDetections}
              activeDetectionIndex={activeDetectionIndex}
              onDetectionSelect={setActiveDetectionIndex}
              recordingTime={recordingTime}
            />
          </Box>

          {/* Dashboard Stats Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Chip label={`${formatTime(recordingTime)} Duration`} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }} />
            <Chip label={`${uniqueSpeciesCount} Species Detected`} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }} />
            <Chip label={`${liveDetections.length} Total Detections`} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }} />
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              label={denoise ? "Noise Reduction: ON" : "Noise Reduction: OFF"}
              onClick={() => setDenoise(!denoise)}
              color={denoise ? "secondary" : "default"}
              sx={{ cursor: 'pointer' }}
            />
          </Box>

          {/* Current Detection and Live Feed */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' }, gap: 4 }}>
            <Box>
              <CurrentDetection detection={currentDetection} />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Live Species Feed</Typography>
              <DetectionList
                detections={liveDetections}
                isLiveFeed={true}
                activeDetectionIndex={activeDetectionIndex}
                onDetectionSelect={setActiveDetectionIndex}
              />
            </Box>
          </Box>
        </>
      )}

      {/* Restore ErrorDialog */}
      <ErrorDialog
        open={!!errorMsg}
        message={errorMsg}
        onClose={() => setErrorMsg('')}
      />
    </Container>
  );
};

export default Record;
