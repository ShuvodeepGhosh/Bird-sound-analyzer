export interface BirdDetection {
  common_name: string;
  scientific_name: string;
  confidence: number;
  start_time: number;
  end_time: number;
}

export interface BirdAnalysisResponse {
  filename: string;
  duration_seconds: number;
  analysis_time_ms: number;
  detections: BirdDetection[];
}
