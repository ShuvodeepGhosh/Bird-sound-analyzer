import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import type { BirdDetection } from '../types';
import { formatOccurrenceTime } from '../utils/timeFormatter';

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
  detectionGroup: { det: BirdDetection; originalIndex: number }[];
  isActive?: boolean;
  activeDetectionIndex?: number | null;
  color?: string;
  onTimestampClick?: (originalIndex: number) => void;
}

const DetectionCard: React.FC<DetectionCardProps> = ({ detectionGroup, isActive, activeDetectionIndex, color = '#2dd4bf', onTimestampClick }) => {
  const primaryDetection = detectionGroup[0].det;
  const highestConfidence = Math.round(Math.max(...detectionGroup.map(g => g.det.confidence)) * 100);
  const [mapOpen, setMapOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

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
      <motion.div
        animate={isActive ? { scale: 1.02, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ height: '100%' }}
      >
        <Card
          sx={{
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${isActive ? color : 'rgba(255, 255, 255, 0.05)'}`,
            boxShadow: isActive ? `0 0 20px ${color}40, 0 12px 40px rgba(0, 0, 0, 0.4)` : 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isActive ? 'none' : 'translateY(-4px)',
              boxShadow: isActive ? `0 0 20px ${color}40, 0 12px 40px rgba(0, 0, 0, 0.4)` : '0 12px 40px rgba(0, 0, 0, 0.4)',
              border: `1px solid ${isActive ? color : 'rgba(216, 243, 220, 0.2)'}`,
            }
          }}
        >
        {/* Top: Image */}
        {primaryDetection.image_url && (
          <Box
            onClick={() => setImageModalOpen(true)}
            sx={{
              width: '100%',
              height: 200,
              backgroundImage: `url(${primaryDetection.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              cursor: 'pointer',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(4, 16, 13, 0.9) 100%)',
                transition: 'opacity 0.3s',
              },
              '&:hover::after': {
                opacity: 0.7, // brighten slightly on hover to indicate clickability
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
                {primaryDetection.common_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2, opacity: 0.8 }}>
                {primaryDetection.scientific_name}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {primaryDetection.order && <Chip label={`Order: ${primaryDetection.order}`} size="small" variant="outlined" sx={{ borderColor: 'rgba(216, 243, 220, 0.3)' }} />}
                {primaryDetection.family && <Chip label={`Family: ${primaryDetection.family}`} size="small" variant="outlined" sx={{ borderColor: 'rgba(216, 243, 220, 0.3)' }} />}
                {primaryDetection.iucn_category && (
                  <Chip
                    label={getIucnDetails(primaryDetection.iucn_category).label}
                    size="small"
                    color={getIucnDetails(primaryDetection.iucn_category).color}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Occurrences</Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap',
                maxHeight: 120, // Fixed size
                overflowY: 'auto', // Scrollbar
                pr: 1,
                // Custom scrollbar styling for better aesthetics
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255, 255, 255, 0.3)' }
              }}
            >
              {detectionGroup.map((g) => {
                const isPillActive = g.originalIndex === activeDetectionIndex;
                return (
                  <Chip 
                    key={g.originalIndex}
                    label={`${formatOccurrenceTime(g.det.start_time)} - ${formatOccurrenceTime(g.det.end_time)}`}
                    onClick={() => onTimestampClick?.(g.originalIndex)}
                    sx={{ 
                      bgcolor: isPillActive ? 'primary.main' : 'rgba(216, 243, 220, 0.15)', 
                      color: isPillActive ? 'primary.contrastText' : '#D8F3DC', 
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: isPillActive ? 'primary.dark' : 'rgba(216, 243, 220, 0.25)' },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {primaryDetection.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1, lineHeight: 1.6, opacity: 0.9 }}>
              {primaryDetection.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto', p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.03)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1, mr: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>Max AI Confidence</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="secondary.main">{highestConfidence}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={highestConfidence}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: highestConfidence > 80 ? 'linear-gradient(90deg, #40916C, #95D5B2)' : (highestConfidence > 50 ? 'linear-gradient(90deg, #B5838D, #E5989B)' : 'linear-gradient(90deg, #780000, #C1121F)'),
                      borderRadius: 4
                    }
                  }}
                />
              </Box>

              {primaryDetection.gbif_taxon_key && (
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
      </motion.div>

      {/* Map Dialog */}
      <Dialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Global Occurrence Heatmap for {primaryDetection.common_name}
          <IconButton onClick={() => setMapOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '60vh' }}>
          {mapOpen && primaryDetection.gbif_taxon_key && (
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
                url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG:3857&taxonKey=${primaryDetection.gbif_taxon_key}&style=purpleYellow.point`}
              />
            </MapContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="lg"
        slotProps={{
          paper: {
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              overflow: 'hidden'
            }
          },
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)'
            }
          }
        }}
      >
        {primaryDetection.image_url && (
          <Box
            onClick={() => setImageModalOpen(false)}
            sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
          >
            <motion.img
              src={primaryDetection.image_url}
              alt={primaryDetection.common_name}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            />
          </Box>
        )}
      </Dialog>
    </>
  );
};

export default DetectionCard;
