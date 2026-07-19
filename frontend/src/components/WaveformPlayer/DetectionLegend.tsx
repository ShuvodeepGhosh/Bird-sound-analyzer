import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { getSpeciesColor } from '../../utils/colorMapper';

interface DetectionLegendProps {
  species: string[];
  activeFilter: string | null;
  onFilterChange: (species: string | null) => void;
}

const DetectionLegend: React.FC<DetectionLegendProps> = ({ species, activeFilter, onFilterChange }) => {
  if (species.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Detected Species
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="All"
          onClick={() => onFilterChange(null)}
          color={activeFilter === null ? 'primary' : 'default'}
          variant={activeFilter === null ? 'filled' : 'outlined'}
          sx={{ cursor: 'pointer' }}
        />
        {species.map((name) => (
          <Chip
            key={name}
            label={name}
            onClick={() => onFilterChange(name === activeFilter ? null : name)}
            variant={activeFilter === name ? 'filled' : 'outlined'}
            sx={{
              cursor: 'pointer',
              borderColor: getSpeciesColor(name),
              backgroundColor: activeFilter === name ? getSpeciesColor(name) : 'transparent',
              color: activeFilter === name ? '#fff' : 'text.primary',
              '&:hover': {
                backgroundColor: activeFilter === name ? getSpeciesColor(name) : `${getSpeciesColor(name)}22`,
              },
              '& .MuiChip-label': {
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              },
            }}
            icon={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getSpeciesColor(name),
                  ml: 1,
                }}
              />
            }
          />
        ))}
      </Box>
    </Box>
  );
};

export default DetectionLegend;
