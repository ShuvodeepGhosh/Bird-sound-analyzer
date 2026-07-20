import { useState, useRef, useEffect, useCallback } from 'react';

export const useLiveRecording = (onChunkReady: (file: File, offset: number) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const chunkTimerRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const currentChunkStartRef = useRef<number>(0);

  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);

  const streamRef = useRef<MediaStream | null>(null);

  // Sync stream state to ref for unmount cleanup
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (chunkTimerRef.current) clearTimeout(chunkTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startNewChunk = useCallback((activeStream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(activeStream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (audioChunksRef.current.length > 0) {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        let ext = 'webm';
        if (mimeType.includes('mp4')) ext = 'm4a';
        else if (mimeType.includes('ogg')) ext = 'ogg';

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([audioBlob], `recording-${new Date().getTime()}.${ext}`, { type: mimeType });
        
        // Ensure this onstop is from the CURRENT active recording session, 
        // preventing race conditions if the user rapidly stopped and restarted.
        if (isRecordingRef.current && mediaRecorderRef.current === mediaRecorder) {
          onChunkReady(file, currentChunkStartRef.current);
          currentChunkStartRef.current += 5; 
          startNewChunk(activeStream);
        }
      }
    };

    mediaRecorder.start();
    
    chunkTimerRef.current = window.setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, 5000);
  }, [onChunkReady]);

  const startRecording = async () => {
    if (isRecordingRef.current) return; // Prevent double execution
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(newStream);
      isRecordingRef.current = true;
      currentChunkStartRef.current = 0;
      setIsRecording(true);
      setRecordingTime(0);

      startNewChunk(newStream);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (chunkTimerRef.current) {
      clearTimeout(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopTracks();
    setStream(null);
  };

  return {
    isRecording,
    recordingTime,
    stream,
    startRecording,
    stopRecording
  };
};
