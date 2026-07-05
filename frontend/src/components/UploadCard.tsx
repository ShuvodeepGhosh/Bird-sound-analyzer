import React, { useCallback, useState } from 'react';
import { Card, CardContent, Typography, Button, Box, useTheme, Chip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    <Card className="animate-fade-in-up" sx={{ maxWidth: 600, width: '100%', mx: 'auto', mt: 4, p: 2, position: 'relative' }}>
      <IconButton 
        onClick={() => navigate('/')} 
        sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
      <CardContent>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: '600', mb: 1, color: 'text.primary' }}>
          Upload Audio Recording
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Supported formats: .wav, .mp3, .flac, .ogg, .m4a (Max 100MB)
        </Typography>

        {!selectedFile ? (
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              cursor: disabled ? 'default' : 'pointer',
              background: isDragActive ? 'rgba(45, 106, 79, 0.05)' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: disabled ? 'transparent' : 'rgba(255,255,255,0.02)',
                borderColor: disabled ? theme.palette.divider : theme.palette.text.secondary,
              }
            }}
          >
            <input {...getInputProps()} />
            <Box sx={{ mb: 2, color: isDragActive ? 'primary.main' : 'text.secondary' }}>
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
            background: 'transparent',
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: 4, 
            textAlign: 'center',
          }}>
            <Typography variant="h6" sx={{ mb: 1, wordBreak: 'break-all', fontWeight: 500 }}>{selectedFile.name}</Typography>
            <Chip label={`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`} sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 500 }} size="small" />
            
            <WaveformPlayer file={selectedFile} />
            
            <Box sx={{ mt: 4, mb: 1 }}>
              {lat && lon ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
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
              <Button variant="outlined" color="inherit" onClick={onClear} disabled={disabled}>
                Change File
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={onAnalyze} 
                disabled={disabled}
                sx={{ px: 4 }}
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
