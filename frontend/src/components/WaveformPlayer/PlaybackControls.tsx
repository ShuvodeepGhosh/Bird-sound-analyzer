import React from 'react';
import { Box, IconButton, Select, MenuItem, Typography, Tooltip, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import Forward5Icon from '@mui/icons-material/Forward5';
import Replay5Icon from '@mui/icons-material/Replay5';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackRate: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onChangeRate: (rate: number) => void;
  onNextBird?: () => void;
  onPrevBird?: () => void;
  disabled?: boolean;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  playbackRate,
  onPlayPause,
  onStop,
  onSkipForward,
  onSkipBackward,
  onChangeRate,
  onNextBird,
  onPrevBird,
  disabled = false,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Tooltip title="Previous Bird">
          <span>
            <IconButton onClick={onPrevBird} disabled={disabled || !onPrevBird} size="small">
              <SkipPreviousIcon />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Skip Backward 5s">
          <span>
            <IconButton onClick={onSkipBackward} disabled={disabled} size="small">
              <Replay5Icon />
            </IconButton>
          </span>
        </Tooltip>

        <IconButton 
          onClick={onPlayPause} 
          disabled={disabled}
          color="primary"
          sx={{ 
            bgcolor: 'primary.light', 
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.main' },
            width: 48,
            height: 48
          }}
        >
          {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
        </IconButton>

        <Tooltip title="Stop">
          <span>
            <IconButton onClick={onStop} disabled={disabled} size="small">
              <StopIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Skip Forward 5s">
          <span>
            <IconButton onClick={onSkipForward} disabled={disabled} size="small">
              <Forward5Icon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Next Bird">
          <span>
            <IconButton onClick={onNextBird} disabled={disabled || !onNextBird} size="small">
              <SkipNextIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">Speed</Typography>
        <Select
          value={playbackRate}
          onChange={(e) => onChangeRate(Number(e.target.value))}
          size="small"
          disabled={disabled}
          sx={{ minWidth: 80, height: 32 }}
        >
          <MenuItem value={0.5}>0.5x</MenuItem>
          <MenuItem value={1}>1x</MenuItem>
          <MenuItem value={1.5}>1.5x</MenuItem>
          <MenuItem value={2}>2x</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default PlaybackControls;
