import React from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBirdHistory } from '../hooks/useBirdHistory';
import DetectionCard from '../components/DetectionCard';
import type { BirdDetection } from '../types';

const History: React.FC = () => {
  const { historyList, clearHistory, isLoaded } = useBirdHistory();

  if (!isLoaded) return null;

  return (
    <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 4, md: 8 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '30px' }}>
            My Discoveries
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You have discovered {historyList.length} unique bird species.
          </Typography>
        </Box>

        {historyList.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your entire discovery history? This cannot be undone.")) {
                clearHistory();
              }
            }}
          >
            Clear History
          </Button>
        )}
      </Box>

      {historyList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Typography variant="h1" sx={{ mb: 2 }}>📖</Typography>
          <Typography variant="h5" gutterBottom>Your journal is empty</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Upload an audio file or start a live recording to discover your first bird species!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {historyList.map(entry => {
            // Convert history entry back to BirdDetection format for the card
            const detectionAsCard: BirdDetection = {
              scientific_name: entry.scientific_name,
              common_name: entry.common_name,
              confidence: 1.0, // Historical entries are implicitly 100% since they were saved
              start_time: 0,
              end_time: 0,
              image_url: entry.image_url,
              description: entry.description,
              order: entry.order,
              family: entry.family,
              gbif_taxon_key: entry.gbif_taxon_key,
              iucn_category: entry.iucn_category
            };

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={entry.scientific_name}>
                <Box sx={{ height: '100%' }}>
                  <DetectionCard
                    detectionGroup={[{ det: detectionAsCard, originalIndex: 0 }]}
                    hideOccurrences={true}
                    compact={true}
                  />
                  <Box sx={{ mt: 1, px: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Detected {entry.detection_count} time{entry.detection_count !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last: {new Date(entry.last_detected_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default History;
