import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import type { BirdDetection } from '../types';

interface DetectionCardProps {
  detection: BirdDetection;
}

const DetectionCard: React.FC<DetectionCardProps> = ({ detection }) => {
  const percentage = Math.round(detection.confidence * 100);
  
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">{detection.common_name}</Typography>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {detection.scientific_name}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ bgcolor: 'rgba(64, 145, 108, 0.2)', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold' }}>
            {detection.start_time.toFixed(1)}s - {detection.end_time.toFixed(1)}s
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Confidence</Typography>
            <Typography variant="body2" fontWeight="bold">{percentage}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            color={percentage > 80 ? 'secondary' : (percentage > 50 ? 'warning' : 'error')}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DetectionCard;
