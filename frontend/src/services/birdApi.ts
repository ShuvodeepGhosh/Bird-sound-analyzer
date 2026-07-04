import { api } from './api';
import type { BirdAnalysisResponse } from '../types';

export const birdApi = {
  analyzeAudio: async (file: File): Promise<BirdAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<BirdAnalysisResponse>('/analyze/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
