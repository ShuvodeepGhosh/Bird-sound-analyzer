import { useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

export const usePlayback = (wavesurfer: WaveSurfer | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlayPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  }, [wavesurfer]);

  const stop = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.stop();
      wavesurfer.seekTo(0);
    }
  }, [wavesurfer]);

  const skipForward = useCallback((seconds: number = 5) => {
    if (wavesurfer) {
      const currentTime = wavesurfer.getCurrentTime();
      const duration = wavesurfer.getDuration();
      wavesurfer.setTime(Math.min(currentTime + seconds, duration));
    }
  }, [wavesurfer]);

  const skipBackward = useCallback((seconds: number = 5) => {
    if (wavesurfer) {
      const currentTime = wavesurfer.getCurrentTime();
      wavesurfer.setTime(Math.max(currentTime - seconds, 0));
    }
  }, [wavesurfer]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (wavesurfer) {
      wavesurfer.setPlaybackRate(rate);
      setPlaybackRate(rate);
    }
  }, [wavesurfer]);

  return {
    isPlaying,
    setIsPlaying, // to be updated by event listeners
    playbackRate,
    togglePlayPause,
    stop,
    skipForward,
    skipBackward,
    changePlaybackRate
  };
};
