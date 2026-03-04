import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useEventsStore } from '@/store/events.store';

interface EventActionsResult {
  isLoading: boolean;
  isError: boolean;
  loadingIds: Set<string>;
  handleJoin: (id: string) => Promise<void>;
  handleLeave: (id: string) => Promise<void>;
  handleRetry: () => Promise<void>;
}

export function useEventActions(): EventActionsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const { fetchEvents, joinEvent, leaveEvent, events } = useEventsStore();

  const loadEvents = async () => {
    setIsLoading(events.length === 0);
    setIsError(false);
    try {
      await fetchEvents();
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = async (id: string) => {
    setLoadingIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });
    try {
      await joinEvent(id);
      await fetchEvents();
      toast.success('You joined the event!');
    } catch {
      // global interceptor fires toast.error
    } finally {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleLeave = async (id: string) => {
    setLoadingIds((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });
    try {
      await leaveEvent(id);
      await fetchEvents();
      toast.success('You left the event.');
    } catch {
      // global interceptor fires toast.error
    } finally {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleRetry = async () => {
    await loadEvents();
  };

  return { isLoading, isError, loadingIds, handleJoin, handleLeave, handleRetry };
}
