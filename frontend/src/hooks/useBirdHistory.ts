import { useState, useEffect, useCallback } from 'react';
import type { BirdDetection } from '../types';

export interface BirdHistoryEntry {
  scientific_name: string;
  common_name: string;
  first_detected_at: string;
  last_detected_at: string;
  detection_count: number;
  image_url?: string;
  description?: string;
  order?: string;
  family?: string;
  gbif_taxon_key?: number;
  iucn_category?: string;
}

const HISTORY_KEY = 'chirpcheck_bird_history';

export const useBirdHistory = () => {
  const [history, setHistory] = useState<Record<string, BirdHistoryEntry>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addDetections = useCallback((detections: BirdDetection[]) => {
    if (detections.length === 0) return;

    setHistory(prev => {
      const updated = { ...prev };
      let changed = false;
      const now = new Date().toISOString();

      detections.forEach(d => {
        const key = d.scientific_name;
        if (updated[key]) {
          updated[key].detection_count += 1;
          updated[key].last_detected_at = now;
          // Merge in image/description if we didn't have it before but do now
          if (!updated[key].image_url && d.image_url) updated[key].image_url = d.image_url;
          if (!updated[key].description && d.description) updated[key].description = d.description;
          changed = true;
        } else {
          updated[key] = {
            scientific_name: d.scientific_name,
            common_name: d.common_name,
            first_detected_at: now,
            last_detected_at: now,
            detection_count: 1,
            image_url: d.image_url,
            description: d.description,
            order: d.order,
            family: d.family,
            gbif_taxon_key: d.gbif_taxon_key,
            iucn_category: d.iucn_category,
          };
          changed = true;
        }
      });

      if (changed) {
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save history to localStorage", e);
        }
        return updated;
      }
      return prev;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory({});
  }, []);

  // Return as sorted array (most recently detected first)
  const historyList = Object.values(history).sort((a, b) => 
    new Date(b.last_detected_at).getTime() - new Date(a.last_detected_at).getTime()
  );

  return {
    historyList,
    historyMap: history,
    addDetections,
    clearHistory,
    isLoaded
  };
};
