import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import DetectionCard from './DetectionCard';
import type { BirdDetection } from '../types';
import { getSpeciesColor } from '../utils/colorMapper';

interface DetectionListProps {
  detections: BirdDetection[];
  activeDetectionIndex?: number | null;
  onDetectionSelect?: (index: number | null) => void;
}

const DetectionList: React.FC<DetectionListProps> = ({ detections, activeDetectionIndex, onDetectionSelect }) => {
  const listRef = useRef<HTMLDivElement>(null);

  if (detections.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4, mt: 3 }}>
        <Typography variant="h6" color="text.secondary">No birds detected in this audio.</Typography>
      </Box>
    );
  }

  // Scroll to active card when it changes
  useEffect(() => {
    if (activeDetectionIndex !== undefined && activeDetectionIndex !== null && listRef.current) {
      const activeElement = document.getElementById(`detection-card-${activeDetectionIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeDetectionIndex]);

  // Group detections by unique bird species, keeping track of original index
  const grouped = detections.reduce((acc, det, idx) => {
    if (!acc[det.scientific_name]) {
      acc[det.scientific_name] = [];
    }
    acc[det.scientific_name].push({ det, originalIndex: idx });
    return acc;
  }, {} as Record<string, { det: BirdDetection; originalIndex: number }[]>);

  const uniqueBirds = Object.values(grouped).sort((a, b) => {
    // Sort groups by the highest confidence in the group
    const maxConfA = Math.max(...a.map(d => d.det.confidence));
    const maxConfB = Math.max(...b.map(d => d.det.confidence));
    return maxConfB - maxConfA;
  });

  return (
    <Box sx={{ mt: 3 }} ref={listRef}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        {uniqueBirds.length === 1 ? '1 Bird Species Detected' : `${uniqueBirds.length} Bird Species Detected`}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
        {uniqueBirds.map((group, idx) => {
          const isCardActive = activeDetectionIndex !== null && group.some(g => g.originalIndex === activeDetectionIndex);
          return (
            <Box key={idx} id={`detection-card-group-${idx}`} sx={{ height: '100%' }}>
              <DetectionCard 
                detectionGroup={group} 
                isActive={isCardActive}
                activeDetectionIndex={activeDetectionIndex}
                color={getSpeciesColor(group[0].det.common_name)}
                onTimestampClick={(originalIndex) => {
                  if (onDetectionSelect) onDetectionSelect(originalIndex);
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default DetectionList;
