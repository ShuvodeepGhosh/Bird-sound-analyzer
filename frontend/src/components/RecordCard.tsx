import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, useTheme, Chip, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import WaveformPlayer from './WaveformPlayer';

interface RecordCardProps {
  onRecordingComplete: (file: File | null) => void;
  selectedFile: File | null;
  onAnalyze: () => void;
  disabled: boolean;
  lat?: number;
  lon?: number;
  onLocationUpdate?: (lat: number, lon: number) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ 
  onRecordingComplete, 
  selectedFile, 
  onAnalyze, 
  disabled, 
  lat, 
  lon, 
  onLocationUpdate 
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [locError, setLocError] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (onLocationUpdate) {
            onLocationUpdate(position.coords.latitude, position.coords.longitude);
          }
          setLocError('');
        },
        (error) => {
          setLocError('Could not get location: ' + error.message);
        }
      );
    } else {
      setLocError('Geolocation is not supported');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        let ext = 'webm';
        if (mimeType.includes('mp4')) ext = 'm4a';
        else if (mimeType.includes('ogg')) ext = 'ogg';

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([audioBlob], `recording-${new Date().getTime()}.${ext}`, { type: mimeType });
        onRecordingComplete(file);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Card className="animate-fade-in-up" sx={{ maxWidth: 600, width: '100%', mx: 'auto', mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom align="center" sx={{ 
          fontWeight: 'bold', 
          background: 'linear-gradient(90deg, #D8F3DC, #95D5B2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          Live Bird Audio Recording
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Record the birds around you for instant AI analysis
        </Typography>

        {!selectedFile ? (
          <Box
            sx={{
              border: `2px dashed ${isRecording ? theme.palette.error.main : 'rgba(216, 243, 220, 0.2)'}`,
              borderRadius: 6,
              p: 6,
              textAlign: 'center',
              background: isRecording 
                ? 'linear-gradient(180deg, rgba(211, 47, 47, 0.15) 0%, rgba(27, 67, 50, 0.05) 100%)' 
                : 'rgba(0,0,0,0.2)',
              animation: isRecording ? 'pulse-glow-error 2s infinite' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Box sx={{ mb: 2 }}>
              {isRecording ? (
                <IconButton 
                  color="error" 
                  onClick={stopRecording}
                  sx={{ 
                    bgcolor: 'rgba(211,47,47,0.1)', 
                    width: 80, height: 80,
                    '&:hover': { bgcolor: 'rgba(211,47,47,0.2)' }
                  }}
                >
                  <StopIcon sx={{ fontSize: 40 }} />
                </IconButton>
              ) : (
                <IconButton 
                  color="secondary" 
                  onClick={startRecording}
                  disabled={disabled}
                  sx={{ 
                    bgcolor: 'rgba(216,243,220,0.1)', 
                    width: 80, height: 80,
                    '&:hover': { bgcolor: 'rgba(216,243,220,0.2)' }
                  }}
                >
                  <MicIcon sx={{ fontSize: 40 }} />
                </IconButton>
              )}
            </Box>
            
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
              {formatTime(recordingTime)}
            </Typography>
            <Typography variant="body2" color={isRecording ? "error.main" : "text.secondary"} sx={{ mt: 1 }}>
              {isRecording ? 'Recording in progress... Click stop when finished.' : 'Click the microphone to start recording'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            p: 4, 
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(216, 243, 220, 0.15)', 
            borderRadius: 6, 
            textAlign: 'center',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h6" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>
                {selectedFile.name}
              </Typography>
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => onRecordingComplete(null)} 
                disabled={disabled}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Chip label={`${(selectedFile.size / (1024)).toFixed(0)} KB`} sx={{ bgcolor: 'secondary.dark', color: 'background.default', fontWeight: 600, mb: 3 }} size="small" />
            
            <WaveformPlayer file={selectedFile} />
            
            <Box sx={{ mt: 2, mb: 1 }}>
              {lat && lon ? (
                <Typography variant="body2" sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Location set: {lat.toFixed(4)}, {lon.toFixed(4)}
                </Typography>
              ) : (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  size="small" 
                  onClick={handleGetLocation}
                  disabled={disabled}
                  sx={{ borderRadius: 20 }}
                >
                  📍 Use My Location for Better Accuracy
                </Button>
              )}
              {locError && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {locError}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={onAnalyze} 
                disabled={disabled}
                sx={{
                  background: 'linear-gradient(135deg, #40916C 0%, #2D6A4F 100%)',
                  color: '#fff',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #52B788 0%, #40916C 100%)',
                  }
                }}
              >
                Analyze Recording
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordCard;
