import { useEffect, useState } from 'react';
import { useForm, type UseFormReturn, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { eventSchema, type EventFormValues } from '@/features/events/schemas/event.schemas';
import { eventsService } from '@/services/events.service';
import { useEventsStore } from '@/store/events.store';
import { useAuthStore } from '@/store/auth.store';

interface UseEventFormOptions {
  id?: string;
}

interface UseEventFormResult {
  isEditMode: boolean;
  isFetching: boolean;
  isSubmitting: boolean;
  fetchError: boolean;
  form: UseFormReturn<EventFormValues>;
  onSubmit: (values: EventFormValues) => Promise<void>;
}

export function useEventForm({ id }: UseEventFormOptions): UseEventFormResult {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isEditMode = !!id;

  const [isFetching, setIsFetching] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: yupResolver(eventSchema) as unknown as Resolver<EventFormValues>,
    defaultValues: {
      title: '',
      description: '',
      location: '',
      capacity: undefined,
      visibility: 'public',
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    setIsFetching(true);
    setFetchError(false);
    eventsService
      .getById(id)
      .then((event) => {
        if (cancelled) return;
        if (event.organizerId !== user?.id) {
          void navigate('/events', { replace: true });
          return;
        }
        reset({
          title: event.title,
          description: event.description ?? '',
          dateTime: new Date(event.dateTime),
          location: event.location,
          capacity: event.capacity ?? undefined,
          visibility: event.visibility,
        });
      })
      .catch(() => {
        if (!cancelled) setFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, user?.id, navigate, reset]);

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    const payload = {
      ...values,
      dateTime: values.dateTime.toISOString(),
      capacity: values.capacity ?? undefined,
      description: values.description || undefined,
    };
    try {
      if (isEditMode) {
        await useEventsStore.getState().updateEvent(id!, payload);
        await useEventsStore.getState().fetchEvents();
        toast.success('Event updated successfully!');
        void navigate(`/events/${id}`, { replace: true });
      } else {
        const created = await eventsService.create(payload);
        await useEventsStore.getState().fetchEvents();
        toast.success('Event created successfully!');
        void navigate(`/events/${created.id}`, { replace: true });
      }
    } catch {
      // global interceptor fires toast.error
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isEditMode, isFetching, isSubmitting, fetchError, form, onSubmit };
}