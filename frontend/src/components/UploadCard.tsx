import React, { useCallback } from 'react';
import { Card, CardContent, Typography, Button, Box, useTheme, Chip } from '@mui/material';
import { useDropzone } from 'react-dropzone';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  onAnalyze: () => void;
  disabled: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({ onFileSelect, selectedFile, onClear, onAnalyze, disabled }) => {
  const theme = useTheme();
  
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
    disabled
  });

  return (
    <Card sx={{ maxWidth: 600, width: '100%', mx: 'auto', mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
          Upload Audio Recording
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Supported formats: .wav, .mp3, .flac, .ogg, .m4a
        </Typography>

        {!selectedFile ? (
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${isDragActive ? theme.palette.secondary.main : 'rgba(149, 213, 178, 0.4)'}`,
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              cursor: disabled ? 'default' : 'pointer',
              bgcolor: isDragActive ? 'rgba(64, 145, 108, 0.1)' : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: disabled ? 'transparent' : 'rgba(64, 145, 108, 0.05)',
              }
            }}
          >
            <input {...getInputProps()} />
            <Typography variant="h6" color="text.primary">
              {isDragActive ? 'Drop audio here...' : 'Drag & Drop audio file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              or click to browse
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 4, border: '1px solid rgba(149, 213, 178, 0.3)', borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1, wordBreak: 'break-all' }}>{selectedFile.name}</Typography>
            <Chip label={`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`} color="secondary" size="small" />
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" color="inherit" onClick={onClear} disabled={disabled}>
                Change File
              </Button>
              <Button variant="contained" color="secondary" onClick={onAnalyze} disabled={disabled}>
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
