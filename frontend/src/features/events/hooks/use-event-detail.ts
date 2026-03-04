import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { eventsService } from '@/services/events.service';
import { useEventsStore } from '@/store/events.store';
import type { EventDetailResponse } from '@/types/event.types';

export interface UseEventDetailResult {
  event: EventDetailResponse | null;
  isLoading: boolean;
  isError: boolean;
  isInFlight: boolean;
  isDeleting: boolean;
  showDeleteModal: boolean;
  setShowDeleteModal: (v: boolean) => void;
  handleJoin: () => Promise<void>;
  handleLeave: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useEventDetail(id: string): UseEventDetailResult {
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInFlight, setIsInFlight] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    eventsService
      .getById(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleJoin = async () => {
    setIsInFlight(true);
    try {
      const updated = await useEventsStore.getState().joinEvent(id);
      setEvent(updated);
      toast.success('You joined the event!');
    } catch {
      // global interceptor fires toast.error
    } finally {
      setIsInFlight(false);
    }
  };

  const handleLeave = async () => {
    setIsInFlight(true);
    try {
      const updated = await useEventsStore.getState().leaveEvent(id);
      setEvent(updated);
      toast.success('You left the event.');
    } catch {
      // global interceptor fires toast.error
    } finally {
      setIsInFlight(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await useEventsStore.getState().deleteEvent(id);
      toast.success('Event deleted.');
      void navigate('/events');
    } catch {
      // global interceptor fires toast.error
      setIsDeleting(false);
    }
  };

  return {
    event,
    isLoading,
    isError,
    isInFlight,
    isDeleting,
    showDeleteModal,
    setShowDeleteModal,
    handleJoin,
    handleLeave,
    handleDelete,
  };
}
