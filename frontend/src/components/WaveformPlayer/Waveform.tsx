import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useWaveform } from '../../hooks/useWaveform';
import { usePlayback } from '../../hooks/usePlayback';
import PlaybackControls from './PlaybackControls';
import DetectionLegend from './DetectionLegend';
import { getSpeciesColor } from '../../utils/colorMapper';
import type { BirdDetection } from '../../types';

interface WaveformProps {
  audioUrl: string;
  detections: BirdDetection[];
  activeDetectionIndex: number | null;
  onDetectionSelect: (index: number | null) => void;
  playTrigger?: number;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, detections, activeDetectionIndex, onDetectionSelect, playTrigger = 0 }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const {
    containerRef,
    timelineRef,
    minimapRef,
    wavesurfer,
    regions,
    isReady,
  } = useWaveform({
    audioUrl,
    onRegionClick: (id) => {
      const idx = parseInt(id, 10);
      if (!isNaN(idx)) {
        onDetectionSelect(idx);
      }
    },
  });

  const {
    isPlaying,
    setIsPlaying,
    playbackRate,
    togglePlayPause,
    stop,
    skipForward,
    skipBackward,
    changePlaybackRate,
  } = usePlayback(wavesurfer);

  // Sync playback state with wavesurfer
  useEffect(() => {
    if (!wavesurfer) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    wavesurfer.on('play', onPlay);
    wavesurfer.on('pause', onPause);
    wavesurfer.on('finish', onPause);
    return () => {
      wavesurfer.un('play', onPlay);
      wavesurfer.un('pause', onPause);
      wavesurfer.un('finish', onPause);
    };
  }, [wavesurfer, setIsPlaying]);

  const pauseAtRef = React.useRef<number | null>(null);

  // Sync active detection to region highlight, seek, and play
  useEffect(() => {
    if (!regions) return;
    const allRegions = regions.getRegions();
    allRegions.forEach(region => {
      const idx = parseInt(region.id, 10);
      const isSelected = idx === activeDetectionIndex;
      const color = getSpeciesColor(detections[idx].common_name);
      
      region.setOptions({
        color: isSelected ? `${color}66` : `${color}33`,
      });
    });
    
    // Seek and play when a detection is selected or triggered
    if (activeDetectionIndex !== null && wavesurfer && playTrigger > 0) {
      const det = detections[activeDetectionIndex];
      // Set the target pause time
      pauseAtRef.current = det.end_time;
      wavesurfer.setTime(det.start_time);
      wavesurfer.play();
    }
  }, [activeDetectionIndex, playTrigger, regions, detections, wavesurfer]);

  // Pause playback when reaching the end of the triggered region
  useEffect(() => {
    if (!wavesurfer) return;
    
    const onTimeUpdate = (currentTime: number) => {
      if (pauseAtRef.current !== null && currentTime >= pauseAtRef.current) {
        wavesurfer.pause();
        pauseAtRef.current = null; // Clear it so manual playback can continue past this point
      }
    };
    
    wavesurfer.on('timeupdate', onTimeUpdate);
    
    return () => {
      wavesurfer.un('timeupdate', onTimeUpdate);
    };
  }, [wavesurfer]);

  // Add regions when wavesurfer is ready
  useEffect(() => {
    if (!regions || !isReady) return;
    
    regions.clearRegions();
    
    detections.forEach((det, index) => {
      if (activeFilter && det.common_name !== activeFilter) return;

      const color = getSpeciesColor(det.common_name);
      const isSelected = index === activeDetectionIndex;

      regions.addRegion({
        id: index.toString(),
        start: det.start_time,
        end: det.end_time,
        content: det.common_name,
        color: isSelected ? `${color}66` : `${color}33`,
        drag: false,
        resize: false,
      });
    });
  }, [regions, isReady, detections, activeFilter, activeDetectionIndex]);

  const uniqueSpecies = useMemo(() => {
    const species = new Set(detections.map(d => d.common_name));
    return Array.from(species);
  }, [detections]);

  const handleNextBird = () => {
    if (!wavesurfer || detections.length === 0) return;
    const currentTime = wavesurfer.getCurrentTime();
    const nextDetIndex = detections.findIndex(d => d.start_time > currentTime + 0.1);
    if (nextDetIndex !== -1) {
      wavesurfer.setTime(detections[nextDetIndex].start_time);
      onDetectionSelect(nextDetIndex);
    }
  };

  const handlePrevBird = () => {
    if (!wavesurfer || detections.length === 0) return;
    const currentTime = wavesurfer.getCurrentTime();
    // Find the last detection that starts before the current time
    for (let i = detections.length - 1; i >= 0; i--) {
      if (detections[i].start_time < currentTime - 0.1) {
        wavesurfer.setTime(detections[i].start_time);
        onDetectionSelect(i);
        return;
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipBackward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, skipForward, skipBackward]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, width: '100%' }}>
      <DetectionLegend 
        species={uniqueSpecies} 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
      />
      
      <Box sx={{ 
        position: 'relative', 
        bgcolor: 'background.paper', 
        p: 2, 
        borderRadius: 2,
        boxShadow: 1
      }}>
        {!isReady && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, bgcolor: 'background.paper' }}>
            <Typography color="text.secondary">Loading audio waveform...</Typography>
          </Box>
        )}
        <Box ref={containerRef} sx={{ mb: 1 }} />
        <Box ref={timelineRef} sx={{ mb: 2 }} />
        <Box ref={minimapRef} sx={{ borderRadius: 1, overflow: 'hidden' }} />
      </Box>

      <PlaybackControls 
        isPlaying={isPlaying}
        playbackRate={playbackRate}
        onPlayPause={togglePlayPause}
        onStop={stop}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        onChangeRate={changePlaybackRate}
        onNextBird={handleNextBird}
        onPrevBird={handlePrevBird}
        disabled={!isReady}
      />
    </Box>
  );
};

export default Waveform;
