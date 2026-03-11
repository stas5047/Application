import { useEffect, useState, useMemo } from 'react';
import { addHours, parseISO, startOfDay, isBefore } from 'date-fns';
import type { MyEventResponse } from '@/types/api.types';
import type { CalendarEventItem } from '@/types/calendar.types';
import { useEventsStore } from '@/store/events.store';

function toCalendarEvent(raw: MyEventResponse): CalendarEventItem {
  const start = parseISO(raw.dateTime);
  return {
    id: raw.id,
    title: raw.title,
    start,
    end: addHours(start, 1),
    role: raw.role,
    tags: raw.tags?.map((t) => t.name),
  };
}

export function useMyEvents() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { fetchMyEvents, myEvents } = useEventsStore();

  const load = async () => {
    const isInitialLoad = myEvents.length === 0;
    setIsLoading(isInitialLoad);
    setIsError(false);
    try { await fetchMyEvents(); }
    catch { setIsError(true); }
    finally { setIsLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);

  const calendarEvents = useMemo(() => {
    const todayStart = startOfDay(new Date());
    return myEvents
      .filter(e => !isBefore(parseISO(e.dateTime), todayStart))
      .map(toCalendarEvent);
  }, [myEvents]);

  return { isLoading, isError, calendarEvents, retry: load };
}
