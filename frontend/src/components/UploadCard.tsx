import React, { useCallback, useState } from 'react';
import { Card, CardContent, Typography, Button, Box, useTheme, Chip } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import WaveformPlayer from './WaveformPlayer';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  onAnalyze: () => void;
  disabled: boolean;
  lat?: number;
  lon?: number;
  onLocationUpdate?: (lat: number, lon: number) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ onFileSelect, selectedFile, onClear, onAnalyze, disabled, lat, lon, onLocationUpdate }) => {
  const theme = useTheme();
  const [locError, setLocError] = useState<string>('');
  
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
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/wav': ['.wav'],
      'audio/mpeg': ['.mp3'],
      'audio/flac': ['.flac'],
      'audio/ogg': ['.ogg'],
      'audio/mp4': ['.m4a'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    disabled
  });

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
          Upload Audio Recording
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Supported formats: .wav, .mp3, .flac, .ogg, .m4a (Max 100MB)
        </Typography>

        {!selectedFile ? (
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${isDragActive ? theme.palette.secondary.main : 'rgba(216, 243, 220, 0.2)'}`,
              borderRadius: 6,
              p: 6,
              textAlign: 'center',
              cursor: disabled ? 'default' : 'pointer',
              background: isDragActive 
                ? 'linear-gradient(180deg, rgba(64, 145, 108, 0.15) 0%, rgba(27, 67, 50, 0.05) 100%)' 
                : 'rgba(0,0,0,0.2)',
              animation: isDragActive ? 'pulse-glow 2s infinite' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: disabled ? 'rgba(0,0,0,0.2)' : 'linear-gradient(180deg, rgba(64, 145, 108, 0.08) 0%, rgba(27, 67, 50, 0.05) 100%)',
                borderColor: 'rgba(216, 243, 220, 0.4)',
                transform: disabled ? 'none' : 'translateY(-2px)'
              }
            }}
          >
            <input {...getInputProps()} />
            <Box sx={{ mb: 2, color: isDragActive ? 'secondary.main' : 'text.secondary' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </Box>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
              {isDragActive ? 'Drop audio here to analyze' : 'Drag & Drop audio file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              or click to browse from your device
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
            <Typography variant="h6" sx={{ mb: 1, wordBreak: 'break-all', fontWeight: 500 }}>{selectedFile.name}</Typography>
            <Chip label={`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`} sx={{ bgcolor: 'secondary.dark', color: 'background.default', fontWeight: 600 }} size="small" />
            
            <WaveformPlayer file={selectedFile} />
            
            <Box sx={{ mt: 4, mb: 1 }}>
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
              <Button variant="outlined" color="inherit" onClick={onClear} disabled={disabled} sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                Change File
              </Button>
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
                Analyze Audio
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadCard;
