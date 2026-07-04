import { api } from './api';
import type { BirdAnalysisResponse } from '../types';

export const birdApi = {
  analyzeAudio: async (data: { file: File, lat?: number, lon?: number }): Promise<BirdAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.lat !== undefined) formData.append('lat', data.lat.toString());
    if (data.lon !== undefined) formData.append('lon', data.lon.toString());

    const response = await api.post<BirdAnalysisResponse>('/analyze/', formData);

    return response.data;
  },
};
