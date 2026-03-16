import { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View, EventProps } from 'react-big-calendar';
import { format, parse, getDay, startOfWeek, isBefore, startOfDay } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB';
import { CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CalendarEvent } from '@/components/ui/calendar-event';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import type { CalendarEventItem } from '@/types/calendar.types';
import { useMyEvents } from './use-my-events';
import { CalendarToolbar } from './CalendarToolbar';
import { MyEventsFilters } from './MyEventsFilters';
import type { RoleFilter, VisibilityFilter } from './MyEventsFilters';
import { MyEventsContext } from './my-events.context';

// ADR-F017: dateFnsLocalizer called at module scope — stable reference required by react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-GB': enGB },
});

// Module-scope wrapper so react-big-calendar does not re-mount events on parent re-renders
function CalendarEventWrapper({ event }: EventProps<CalendarEventItem>) {
  return <CalendarEvent event={event} />;
}

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { isLoading, isError, calendarEvents, retry } = useMyEvents();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  const [view, setView] = useState<View>(() =>
    window.innerWidth <= 640 ? 'agenda' : 'month',
  );
  const [date, setDate] = useState(() => new Date());

  // Filter state
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
      if (mobile) {
        setView('agenda');
      } else {
        setView((v) => (v === 'agenda' ? 'month' : v));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectEvent = useCallback(
    (event: CalendarEventItem) => {
      if (isBefore(event.start, startOfDay(new Date())) && event.role !== 'organizer') return;
      void navigate(`/events/${event.id}`);
    },
    [navigate],
  );

  const handleShowMore = useCallback((_events: CalendarEventItem[], d: Date) => {
    setDate(d);
    setView('week');
  }, []);

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((e) => {
      if (!showPast && isBefore(e.start, startOfDay(new Date()))) return false;
      if (roleFilter !== 'all' && e.role !== roleFilter) return false;
      if (visibilityFilter !== 'all' && e.visibility !== visibilityFilter) return false;
      if (selectedTags.length > 0 && !selectedTags.some((t) => e.tags?.includes(t))) return false;
      return true;
    });
  }, [calendarEvents, showPast, roleFilter, visibilityFilter, selectedTags]);

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

  const isFiltered =
    roleFilter !== 'all' || visibilityFilter !== 'all' || selectedTags.length > 0;

  return (
    <MyEventsContext.Provider value={{ showPast }}>
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">My Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your event calendar</p>
        </div>

        <MyEventsFilters
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          visibilityFilter={visibilityFilter}
          onVisibilityChange={setVisibilityFilter}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          showPast={showPast}
          onShowPastChange={setShowPast}
        />

        {filteredEvents.length === 0 && isFiltered ? (
          <EmptyState
            icon={CalendarDays}
            heading="No events match your filters."
            subText="Try adjusting the filters above."
          />
        ) : (
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Calendar<CalendarEventItem>
              localizer={localizer}
              events={filteredEvents}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              views={isMobile ? ['agenda'] : ['month', 'week', 'agenda']}
              onSelectEvent={handleSelectEvent}
              onShowMore={handleShowMore}
              components={{ toolbar: CalendarToolbar, event: CalendarEventWrapper }}
              style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}
              culture="en-GB"
              titleAccessor="title"
              startAccessor="start"
              endAccessor="end"
              formats={{
                agendaDateFormat: 'dd/MM/yyyy',
                dayFormat: 'dd/MM/yyyy',
                dateFormat: 'dd',
                timeGutterFormat: 'hh:mm a',
                agendaTimeRangeFormat: ({ start }: { start: Date }) => format(start, 'hh:mm a'),
              }}
            />
          </div>
        )}
      </div>
    </MyEventsContext.Provider>
  );
}
