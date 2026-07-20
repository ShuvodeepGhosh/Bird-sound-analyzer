import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { getSpeciesColor } from '../utils/colorMapper';
import type { BirdDetection } from '../types';

interface LiveWaveformProps {
  stream: MediaStream | null;
  isRecording: boolean;
  detections: BirdDetection[];
  activeDetectionIndex: number | null;
  onDetectionSelect: (index: number | null) => void;
  recordingTime: number; // in seconds
}

const VISIBLE_SECONDS = 30; // How many seconds of history to show

const LiveWaveform: React.FC<LiveWaveformProps> = ({
  stream,
  isRecording,
  detections,
  activeDetectionIndex,
  onDetectionSelect,
  recordingTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number | null>(null);

  // History buffer for the waveform (values 0-255)
  // We want to store roughly enough points to fill the canvas width.
  // E.g. 1000 points for 30 seconds = 33 points per second.
  const POINTS_PER_SECOND = 40;
  const historyRef = useRef<{ t: number, a: number }[]>([]);

  // Refs for props to avoid stale closures in requestAnimationFrame
  const recordingTimeRef = useRef(recordingTime);
  const detectionsRef = useRef(detections);
  const activeDetectionIndexRef = useRef(activeDetectionIndex);

  recordingTimeRef.current = recordingTime;
  detectionsRef.current = detections;
  activeDetectionIndexRef.current = activeDetectionIndex;

  useEffect(() => {
    if (!isRecording || !stream) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => { });
        audioContextRef.current = null;
      }
      return;
    }

    historyRef.current = [];

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    const startTime = performance.now();
    let lastTime = startTime;

    const draw = () => {
      const time = performance.now();
      const dt = time - lastTime;
      const elapsedSeconds = (time - startTime) / 1000;

      if (dt >= 1000 / POINTS_PER_SECOND) {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArrayRef.current as any);

          // Get max amplitude in this small window
          let max = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = Math.abs(dataArrayRef.current[i] - 128);
            if (v > max) max = v;
          }

          historyRef.current.push({ t: elapsedSeconds, a: max });
          // Limit history size to prevent memory leak
          if (historyRef.current.length > POINTS_PER_SECOND * 3600) { // Keep 1 hour
            historyRef.current.shift();
          }
        }
        lastTime = time;
      }

      renderCanvas(elapsedSeconds);
      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => { });
      }
    };
  }, [isRecording, stream]);

  const renderCanvas = (elapsedSeconds?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    const history = historyRef.current;

    if (!isRecording && history.length === 0) {
      ctx.fillStyle = theme.palette.text.secondary;
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for microphone...', width / 2, height / 2);
      return;
    }

    // Determine time window
    const maxTime = elapsedSeconds !== undefined ? elapsedSeconds : recordingTimeRef.current;
    const minTime = Math.max(0, maxTime - VISIBLE_SECONDS);
    const pixelsPerSecond = width / VISIBLE_SECONDS;

    // 1. Draw Regions
    detectionsRef.current.forEach((det, idx) => {
      if (det.end_time < minTime || det.start_time > maxTime) return; // Outside view

      const startX = (det.start_time - minTime) * pixelsPerSecond;
      const endX = (det.end_time - minTime) * pixelsPerSecond;
      const rectWidth = endX - startX;

      const color = getSpeciesColor(det.common_name);
      const isSelected = idx === activeDetectionIndexRef.current;

      ctx.fillStyle = isSelected ? `${color}44` : `${color}22`; // More transparent
      ctx.fillRect(startX, 0, rectWidth, height);

      // Top border indicator
      ctx.fillStyle = color;
      ctx.fillRect(startX, 0, rectWidth, 4);

      if (isSelected) {
        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, 0, rectWidth, height);
        ctx.shadowBlur = 0;
      }
    });

    // 2. Draw Waveform
    if (history.length > 0) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = theme.palette.primary.main;
      ctx.beginPath();

      const midY = height / 2;

      const totalPointsRecorded = history.length;

      for (let i = 0; i < totalPointsRecorded; i++) {
        const pt = history[i] as any; // Handle both {t, a} or raw number just in case

        let timeOfPoint: number;
        let amplitude: number;

        if (typeof pt === 'object' && pt !== null && 'a' in pt) {
          timeOfPoint = pt.t;
          amplitude = pt.a;
        } else {
          timeOfPoint = recordingTime - ((totalPointsRecorded - 1 - i) / POINTS_PER_SECOND);
          amplitude = pt;
        }

        if (timeOfPoint < minTime || timeOfPoint > maxTime) continue;

        const x = (timeOfPoint - minTime) * pixelsPerSecond;
        // Map 0-128 to 0-(height/2)
        const h = (amplitude / 128) * (height / 2);

        ctx.moveTo(x, midY - h);
        ctx.lineTo(x, midY + h);
      }
      ctx.stroke();
    }

    // 3. Draw time grid
    ctx.fillStyle = theme.palette.text.secondary;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    const startTick = Math.ceil(minTime / 5) * 5;
    for (let t = startTick; t <= maxTime; t += 5) {
      const x = (t - minTime) * pixelsPerSecond;
      ctx.fillText(`${t}s`, x, height - 5);

      ctx.beginPath();
      ctx.moveTo(x, height - 20);
      ctx.lineTo(x, height);
      ctx.strokeStyle = theme.palette.divider;
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const maxTime = recordingTime;
    const minTime = Math.max(0, maxTime - VISIBLE_SECONDS);
    const clickedTime = minTime + (x / rect.width) * VISIBLE_SECONDS;

    for (let i = detections.length - 1; i >= 0; i--) {
      const det = detections[i];
      if (clickedTime >= det.start_time && clickedTime <= det.end_time) {
        onDetectionSelect(i);
        return;
      }
    }

    onDetectionSelect(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 160;
        if (!isRecording) renderCanvas();
      }
    };

    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, [isRecording]);

  // Manually re-render if activeDetectionIndex or detections change while paused
  useEffect(() => {
    if (!isRecording) {
      renderCanvas();
    }
  }, [isRecording, activeDetectionIndex, detections]);

  return (
    <Box sx={{ width: '100%', height: 160, position: 'relative', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={handleCanvasClick}
      />
    </Box>
  );
};

export default LiveWaveform;
