import { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View, EventProps, ToolbarProps } from 'react-big-calendar';
import { format, parse, getDay, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { CalendarCheck, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CalendarEvent } from '@/components/ui/calendar-event';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

// ADR-F017: defined at module scope — stable reference required by react-big-calendar
const VIEWS: View[] = ['month', 'week', 'agenda'];
const VIEW_LABELS: Record<string, string> = { month: 'Month', week: 'Week', agenda: 'Agenda' };
const TODAY_LABEL: Record<string, string> = {
  month: 'This Month',
  week: 'This Week',
  agenda: 'Next 30 Days',
};

function CalendarToolbar({ label, view, views, onNavigate, onView }: ToolbarProps<CalendarEventItem>) {
  return (
    <div className="flex items-center justify-between px-1 pb-3">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Today"
        >
          <CalendarCheck className="h-4 w-4" />
          {TODAY_LABEL[view] ?? 'Today'}
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <span className="text-sm font-semibold">{label}</span>

      <div className="flex items-center gap-1">
        {(Array.isArray(views) ? views : VIEWS).map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded transition-colors',
              view === v
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted',
            )}
          >
            {VIEW_LABELS[v] ?? v}
          </button>
        ))}
      </div>
    </div>
  );
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

  const handleShowMore = useCallback((_events: CalendarEventItem[], date: Date) => {
    setDate(date);
    setView('week');
  }, []);

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
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage your event calendar</p>
      </div>
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
        onShowMore={handleShowMore}
        components={{ toolbar: CalendarToolbar, event: CalendarEventWrapper }}
        style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}
        culture="en-US"
        titleAccessor="title"
        startAccessor="start"
        endAccessor="end"
      />
      </div>
    </div>
  );
}
