import type { EventSummaryResponse } from '@/types/event.types';

export interface RecommendationResponse extends EventSummaryResponse {
  matchScore: number; // 0–1 Jaccard similarity; 0 = cold-start
}
