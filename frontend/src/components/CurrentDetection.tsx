import React from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { getSpeciesColor } from '../utils/colorMapper';
import type { BirdDetection } from '../types';

interface CurrentDetectionProps {
  detection: BirdDetection | null;
}

const CurrentDetection: React.FC<CurrentDetectionProps> = ({ detection }) => {
  if (!detection) {
    return (
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5, mb: 1 }}>
          Currently Hearing
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Listening...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          No bird currently detected
        </Typography>
      </Paper>
    );
  }

  const color = getSpeciesColor(detection.common_name);
  const duration = (detection.end_time - detection.start_time).toFixed(1);
  const confidence = Math.round(detection.confidence * 100);

  return (
    <Fade in={true} key={detection.start_time}>
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: 'background.paper', 
        borderRadius: 4, 
        borderLeft: `6px solid ${color}`,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: color, 
          opacity: 0.05, 
          pointerEvents: 'none' 
        }} />
        
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5, mb: 0.5 }}>
          Currently Hearing
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color, display: 'inline-block' }} />
            {detection.common_name}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>
            {confidence}%
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Detected for {duration} seconds
        </Typography>
      </Paper>
    </Fade>
  );
};

export default CurrentDetection;
