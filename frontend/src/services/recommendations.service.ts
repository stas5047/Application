import apiClient from '@/lib/axios';
import type { RecommendationResponse } from '@/types/recommendation.types';

export const recommendationsService = {
  getAll: () =>
    apiClient.get<RecommendationResponse[]>('/recommendations').then((r) => r.data),
};
