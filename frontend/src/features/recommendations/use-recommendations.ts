import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useEventsStore } from '@/store/events.store';
import { recommendationsService } from '@/services/recommendations.service';
import type { RecommendationResponse } from '@/types/recommendation.types';

interface UseRecommendationsResult {
  recommendations: RecommendationResponse[];
  isLoading: boolean;
  isError: boolean;
  loadingIds: Set<string>;
  handleJoin: (id: string) => Promise<void>;
  handleLeave: (id: string) => Promise<void>;
  handleRetry: () => Promise<void>;
}

export function useRecommendations(): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const joinEvent = useEventsStore((s) => s.joinEvent);
  const leaveEvent = useEventsStore((s) => s.leaveEvent);

  const fetchRecommendations = async () => {
    setIsLoading(recommendations.length === 0);
    setIsError(false);
    try {
      const data = await recommendationsService.getAll();
      setRecommendations(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLoadingId = (id: string) =>
    setLoadingIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });

  const removeLoadingId = (id: string) =>
    setLoadingIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });

  const handleJoin = async (id: string) => {
    addLoadingId(id);
    try {
      await joinEvent(id);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      toast.success('You joined the event!');
    } catch {
      // global interceptor fires toast.error
    } finally {
      removeLoadingId(id);
    }
  };

  const handleLeave = async (id: string) => {
    addLoadingId(id);
    try {
      await leaveEvent(id);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      toast.success('You left the event.');
    } catch {
      // global interceptor fires toast.error
    } finally {
      removeLoadingId(id);
    }
  };

  const handleRetry = async () => {
    await fetchRecommendations();
  };

  return { recommendations, isLoading, isError, loadingIds, handleJoin, handleLeave, handleRetry };
}
