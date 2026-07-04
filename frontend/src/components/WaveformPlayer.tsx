import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface WaveformPlayerProps {
  file: File;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ file }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: theme.palette.secondary.light,
      progressColor: theme.palette.secondary.main,
      cursorColor: theme.palette.secondary.dark,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 60,
    });

    wavesurferRef.current = wavesurfer;

    const url = URL.createObjectURL(file);
    wavesurfer.load(url);

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on('audioprocess', (time) => {
      setCurrentTime(time);
    });

    wavesurfer.on('seeking', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));

    return () => {
      wavesurfer.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file, theme]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
    return `${m}:${s}.${ms}`;
  };

  return (
    <Box sx={{ width: '100%', my: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          onClick={handlePlayPause} 
          color="secondary"
          sx={{ 
            bgcolor: 'rgba(216,243,220,0.1)', 
            mr: 2,
            '&:hover': { bgcolor: 'rgba(216,243,220,0.2)' }
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Box sx={{ flexGrow: 1 }} ref={containerRef} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', fontFamily: 'monospace' }}>
        <Typography variant="body2" color="text.secondary">
          Timestamp: {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>
    </Box>
  );
};

export default WaveformPlayer;
