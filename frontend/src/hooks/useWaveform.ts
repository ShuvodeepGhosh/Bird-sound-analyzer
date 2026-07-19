import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.esm.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugins/minimap.esm.js';
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js';
import { useTheme } from '@mui/material';

interface UseWaveformProps {
  audioUrl: string;
  onReady?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
  onRegionClick?: (regionId: string) => void;
  onRegionIn?: (regionId: string) => void;
  onRegionOut?: (regionId: string) => void;
  onFinish?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export const useWaveform = ({
  audioUrl,
  onReady,
  onTimeUpdate,
  onRegionClick,
  onRegionIn,
  onRegionOut,
  onFinish,
  onPlay,
  onPause
}: UseWaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const theme = useTheme();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !timelineRef.current || !minimapRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      progressColor: theme.palette.primary.main,
      cursorColor: theme.palette.secondary.main,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 120,
      minPxPerSec: 50,
      autoScroll: true,
      autoCenter: true,
      plugins: [
        TimelinePlugin.create({
          container: timelineRef.current,
          height: 24,
          timeInterval: 5,
          primaryLabelInterval: 10,
          style: {
            fontSize: '12px',
            color: theme.palette.text.secondary,
          },
        }),
        HoverPlugin.create({
          lineColor: 'rgba(255, 255, 255, 0.5)',
          lineWidth: 2,
          labelBackground: 'rgba(0, 0, 0, 0.75)',
          labelColor: '#fff',
          labelSize: '11px',
        }),
        MinimapPlugin.create({
          container: minimapRef.current,
          height: 40,
          waveColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          progressColor: 'rgba(100, 100, 100, 0.5)',
          cursorColor: 'transparent',
          overlayColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }),
        ZoomPlugin.create({
          scale: 0.5,
          maxZoom: 200,
        }),
      ],
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsPluginRef.current = regions;
    wavesurferRef.current = ws;

    ws.load(audioUrl);

    ws.on('ready', () => {
      setIsReady(true);
      if (onReady) onReady(ws.getDuration());
    });

    ws.on('audioprocess', (time) => {
      if (onTimeUpdate) onTimeUpdate(time);
    });

    ws.on('seeking', () => {
      if (onTimeUpdate) onTimeUpdate(ws.getCurrentTime());
    });

    ws.on('play', () => { if (onPlay) onPlay(); });
    ws.on('pause', () => { if (onPause) onPause(); });
    ws.on('finish', () => { if (onFinish) onFinish(); });

    regions.on('region-clicked', (region, e) => {
      e.stopPropagation(); // prevent triggering seek on waveform click
      region.play();
      if (onRegionClick) onRegionClick(region.id);
    });

    regions.on('region-in', (region) => {
      if (onRegionIn) onRegionIn(region.id);
    });

    regions.on('region-out', (region) => {
      if (onRegionOut) onRegionOut(region.id);
    });

    return () => {
      ws.destroy();
    };
  }, [audioUrl, theme]);

  const setZoom = useCallback((zoomValue: number) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.zoom(zoomValue);
    }
  }, []);

  return {
    containerRef,
    timelineRef,
    minimapRef,
    wavesurfer: wavesurferRef.current,
    regions: regionsPluginRef.current,
    isReady,
    setZoom
  };
};
