import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import type { BirdAnalysisResponse } from '../types';
import { formatOccurrenceTime, formatProcessingTime } from '../utils/timeFormatter';

interface ResultSummaryProps {
  result: BirdAnalysisResponse;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ result }) => {
  const uniqueBirds = new Set(result.detections.map(d => d.common_name)).size;

  return (
    <Paper className="animate-fade-in-up" sx={{ p: 4, borderRadius: 6, bgcolor: 'rgba(27, 67, 50, 0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>
        Analysis Summary
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        {result.filename}
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 2, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, fontSize: '0.75rem' }}>Audio Duration</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(90deg, #D8F3DC, #95D5B2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatOccurrenceTime(result.duration_seconds)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 2, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, fontSize: '0.75rem' }}>Processing Time</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(90deg, #D8F3DC, #95D5B2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatProcessingTime(result.analysis_time_ms)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 2, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, fontSize: '0.75rem' }}>Unique Species</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(90deg, #D8F3DC, #95D5B2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {uniqueBirds}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResultSummary;
