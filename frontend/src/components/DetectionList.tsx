import React from 'react';
import { Box, Typography } from '@mui/material';
import DetectionCard from './DetectionCard';
import type { BirdDetection } from '../types';

interface DetectionListProps {
  detections: BirdDetection[];
}

const DetectionList: React.FC<DetectionListProps> = ({ detections }) => {
  if (detections.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4, mt: 3 }}>
        <Typography variant="h6" color="text.secondary">No birds detected in this audio.</Typography>
      </Box>
    );
  }

  // Sort by confidence descending
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
        Detections ({detections.length})
      </Typography>
      {sorted.map((det, idx) => (
        <DetectionCard key={idx} detection={det} />
      ))}
    </Box>
  );
};

export default DetectionList;
