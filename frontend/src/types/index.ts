export interface BirdDetection {
  common_name: string;
  scientific_name: string;
  confidence: number;
  start_time: number;
  end_time: number;
  image_url?: string;
  description?: string;
  order?: string;
  family?: string;
  gbif_taxon_key?: number;
  iucn_category?: string;
}

export interface BirdAnalysisResponse {
  filename: string;
  duration_seconds: number;
  analysis_time_ms: number;
  detections: BirdDetection[];
}
