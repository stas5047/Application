import { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View, EventProps } from 'react-big-calendar';
import { format, parse, getDay, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CalendarEvent } from '@/components/ui/calendar-event';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import type { CalendarEventItem } from '@/types/calendar.types';
import { useMyEvents } from './use-my-events';

// ADR-F017: dateFnsLocalizer called at module scope — stable reference required by react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

// Module-scope wrapper so react-big-calendar does not re-mount events on parent re-renders
function CalendarEventWrapper({ event }: EventProps<CalendarEventItem>) {
  return <CalendarEvent event={event} />;
}

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { isLoading, isError, calendarEvents, retry } = useMyEvents();
  const [view, setView] = useState<View>(() =>
    window.innerWidth <= 640 ? 'agenda' : 'month',
  );
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth <= 640) {
        setView('agenda');
        } else {
        setView(v => v === 'agenda' ? 'month' : v);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = useMemo(() => window.innerWidth <= 640, []);

  const handleSelectEvent = useCallback(
    (event: CalendarEventItem) => {
      void navigate(`/events/${event.id}`);
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Failed to load your events.</p>
        <Button variant="outline" onClick={() => void retry()}>Try again</Button>
      </div>
    );
  }

  if (calendarEvents.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        heading="No events yet"
        subText="You are not part of any events yet. Explore public events and join."
        ctaLabel="Browse Events"
        onCta={() => void navigate('/events')}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <Calendar<CalendarEventItem>
        localizer={localizer}
        events={calendarEvents}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={isMobile ? ['agenda'] : ['month', 'week', 'agenda']}
        onSelectEvent={handleSelectEvent}
        components={{ event: CalendarEventWrapper }}
        style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}
        culture="en-US"
        titleAccessor="title"
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
}
