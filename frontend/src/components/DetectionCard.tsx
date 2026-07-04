import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { BirdDetection } from '../types';

const MapResizer = () => {
  const map = useMap();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

interface DetectionCardProps {
  detection: BirdDetection;
}

const DetectionCard: React.FC<DetectionCardProps> = ({ detection }) => {
  const [mapOpen, setMapOpen] = useState(false);
  const percentage = Math.round(detection.confidence * 100);

  const getIucnDetails = (code: string) => {
    switch (code) {
      case 'EX': return { label: 'Extinct', color: 'error' as const };
      case 'EW': return { label: 'Extinct in the Wild', color: 'error' as const };
      case 'CR': return { label: 'Critically Endangered', color: 'error' as const };
      case 'EN': return { label: 'Endangered', color: 'error' as const };
      case 'VU': return { label: 'Vulnerable', color: 'warning' as const };
      case 'NT': return { label: 'Near Threatened', color: 'warning' as const };
      case 'LC': return { label: 'Least Concern', color: 'success' as const };
      case 'DD': return { label: 'Data Deficient', color: 'default' as const };
      case 'NE': return { label: 'Not Evaluated', color: 'default' as const };
      default: return { label: code, color: 'default' as const };
    }
  };


  return (
    <>
      <Card
        className="animate-fade-in-up"
        sx={{
          mb: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          border: '1px solid rgba(255, 255, 255, 0.05)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(216, 243, 220, 0.2)',
          }
        }}
      >
        {/* Left Side: Image */}
        {detection.image_url && (
          <Box
            sx={{
              width: { xs: '100%', sm: 220 },
              minWidth: { sm: 220 },
              height: { xs: 200, sm: 'auto' },
              backgroundImage: `url(${detection.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(4, 16, 13, 0.8) 100%)',
                display: { xs: 'none', sm: 'block' }
              }
            }}
          />
        )}

        {/* Right Side: Content */}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #FFFFFF, #D8F3DC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                {detection.common_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontStyle="italic" sx={{ mb: 2, opacity: 0.8 }}>
                {detection.scientific_name}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {detection.order && <Chip label={`Order: ${detection.order}`} size="small" variant="outlined" sx={{ borderColor: 'rgba(216, 243, 220, 0.3)' }} />}
                {detection.family && <Chip label={`Family: ${detection.family}`} size="small" variant="outlined" sx={{ borderColor: 'rgba(216, 243, 220, 0.3)' }} />}
                {detection.iucn_category && (
                  <Chip
                    label={getIucnDetails(detection.iucn_category).label}
                    size="small"
                    color={getIucnDetails(detection.iucn_category).color}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </Box>
            <Typography variant="body2" sx={{ bgcolor: 'rgba(216, 243, 220, 0.15)', color: '#D8F3DC', px: 2, py: 1, borderRadius: 2, fontWeight: 'bold' }}>
              {detection.start_time.toFixed(1)}s - {detection.end_time.toFixed(1)}s
            </Typography>
          </Box>

          {detection.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1, lineHeight: 1.6, opacity: 0.9 }}>
              {detection.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto', p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.03)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1, mr: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>AI Confidence</Typography>
                  <Typography variant="body2" fontWeight="bold" color="secondary.main">{percentage}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: percentage > 80 ? 'linear-gradient(90deg, #40916C, #95D5B2)' : (percentage > 50 ? 'linear-gradient(90deg, #B5838D, #E5989B)' : 'linear-gradient(90deg, #780000, #C1121F)'),
                      borderRadius: 4
                    }
                  }}
                />
              </Box>

              {detection.gbif_taxon_key && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<MapIcon />}
                  onClick={() => setMapOpen(true)}
                  size="small"
                >
                  Heatmap
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Map Dialog */}
      <Dialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Global Occurrence Heatmap for {detection.common_name}
          <IconButton onClick={() => setMapOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '60vh' }}>
          {mapOpen && detection.gbif_taxon_key && (
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
              <MapResizer />
              {/* Base Map */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* GBIF Density Overlay */}
              <TileLayer
                attribution='&copy; <a href="https://www.gbif.org">GBIF</a>'
                url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG:3857&taxonKey=${detection.gbif_taxon_key}&style=purpleYellow.point`}
              />
            </MapContainer>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DetectionCard;
