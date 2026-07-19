import React from 'react';
import { Backdrop, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

const AudioWaveLoader = () => {
  const bars = [
    { max: 40, color: '#D8F3DC', delay: 0.0 },
    { max: 70, color: '#B7E4C7', delay: 0.1 },
    { max: 90, color: '#95D5B2', delay: 0.2 },
    { max: 110, color: '#74C69D', delay: 0.3 }, // Center peak
    { max: 90, color: '#52B788', delay: 0.4 },
    { max: 70, color: '#40916C', delay: 0.5 },
    { max: 40, color: '#2D6A4F', delay: 0.6 },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, height: 120 }}>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          animate={{ height: [20, bar.max, 20] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: bar.delay
          }}
          style={{
            width: 8,
            backgroundColor: bar.color,
            borderRadius: 8,
            boxShadow: `0 0 10px ${bar.color}80`
          }}
        />
      ))}
    </Box>
  );
};

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ open, message = 'Analyzing bird calls...' }) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: 'blur(10px)' }}
      open={open}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AudioWaveLoader />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 500, background: 'linear-gradient(90deg, #D8F3DC, #95D5B2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1 }}>
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
