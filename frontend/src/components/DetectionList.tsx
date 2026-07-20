import React, { useEffect, useRef, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import DetectionCard from './DetectionCard';
import type { BirdDetection } from '../types';
import { getSpeciesColor } from '../utils/colorMapper';

interface DetectionListProps {
  detections: BirdDetection[];
  activeDetectionIndex?: number | null;
  onDetectionSelect?: (index: number | null) => void;
  isLiveFeed?: boolean;
}

const DetectionList: React.FC<DetectionListProps> = ({ detections, activeDetectionIndex, onDetectionSelect, isLiveFeed = false }) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeDetectionIndex !== undefined && activeDetectionIndex !== null && listRef.current) {
      const activeElement = document.getElementById(`detection-card-${activeDetectionIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeDetectionIndex]);

  // Compute grouped detections
  const renderGroups = useMemo(() => {
    if (isLiveFeed) {
      // In live feed, newest at top. Merge consecutive detections of the same species.
      const merged: { group: { det: BirdDetection; originalIndex: number }[] }[] = [];
      
      // Sort by start_time ascending first to merge properly
      const sorted = detections.map((det, idx) => ({ det, originalIndex: idx }))
                               .sort((a, b) => a.det.start_time - b.det.start_time);
      
      for (const item of sorted) {
        if (merged.length === 0) {
          merged.push({ group: [item] });
        } else {
          const lastMerged = merged[merged.length - 1];
          const lastItem = lastMerged.group[lastMerged.group.length - 1];
          
          // Merge if same species and within 10 seconds of each other
          if (lastItem.det.scientific_name === item.det.scientific_name && 
              item.det.start_time - lastItem.det.end_time < 10) {
            lastMerged.group.push(item);
          } else {
            merged.push({ group: [item] });
          }
        }
      }
      
      // Reverse so newest is at the top
      return merged.reverse().map(m => m.group);
      
    } else {
      // Group by species for static file analysis
      const grouped = detections.reduce((acc, det, idx) => {
        if (!acc[det.scientific_name]) {
          acc[det.scientific_name] = [];
        }
        acc[det.scientific_name].push({ det, originalIndex: idx });
        return acc;
      }, {} as Record<string, { det: BirdDetection; originalIndex: number }[]>);
    
      return Object.values(grouped).sort((a, b) => {
        const maxConfA = Math.max(...a.map(d => d.det.confidence));
        const maxConfB = Math.max(...b.map(d => d.det.confidence));
        return maxConfB - maxConfA;
      });
    }
  }, [detections, isLiveFeed]);

  if (detections.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4, mt: 3 }}>
        <Typography variant="h6" color="text.secondary">No birds detected in this audio.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }} ref={listRef}>
      {!isLiveFeed && (
        <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
          {renderGroups.length === 1 ? '1 Bird Species Detected' : `${renderGroups.length} Bird Species Detected`}
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
        {renderGroups.map((group, idx) => {
          const isCardActive = activeDetectionIndex !== null && group.some(g => g.originalIndex === activeDetectionIndex);
          return (
            <Box key={isLiveFeed ? `live-group-${group[0].originalIndex}` : `group-${idx}`} id={`detection-card-group-${idx}`} sx={{ height: '100%' }}>
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
