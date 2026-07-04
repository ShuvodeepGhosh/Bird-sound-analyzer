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

  // Group detections by unique bird species
  const grouped = detections.reduce((acc, det) => {
    if (!acc[det.scientific_name]) {
      acc[det.scientific_name] = [];
    }
    acc[det.scientific_name].push(det);
    return acc;
  }, {} as Record<string, BirdDetection[]>);

  // For each unique bird, pick the detection with the highest confidence
  const uniqueBirds = Object.values(grouped).map(group => {
    return group.sort((a, b) => b.confidence - a.confidence)[0];
  }).sort((a, b) => b.confidence - a.confidence);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        {uniqueBirds.length === 1 ? '1 Bird Species Detected' : `${uniqueBirds.length} Unique Bird Species Detected`}
      </Typography>
      {uniqueBirds.map((det, idx) => (
        <DetectionCard key={idx} detection={det} />
      ))}
    </Box>
  );
};

export default DetectionList;
