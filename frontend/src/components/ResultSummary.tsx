import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import type { BirdAnalysisResponse } from '../types';

interface ResultSummaryProps {
  result: BirdAnalysisResponse;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ result }) => {
  const uniqueBirds = new Set(result.detections.map(d => d.common_name)).size;

  return (
    <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(27, 67, 50, 0.4)' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Analysis Summary
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        {result.filename}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Audio Duration</Typography>
              <Typography variant="h6">{result.duration_seconds.toFixed(1)}s</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Processing Time</Typography>
              <Typography variant="h6">{result.analysis_time_ms}ms</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Unique Species</Typography>
              <Typography variant="h6">{uniqueBirds}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResultSummary;
