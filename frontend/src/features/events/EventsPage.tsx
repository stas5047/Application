import { useState } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/ui/event-card';
import { useAuthStore } from '@/store/auth.store';
import { useEventsStore } from '@/store/events.store';
import { EventCardSkeleton } from './components/EventCardSkeleton';
import { EventCta } from './components/EventCta';
import { useEventActions } from './hooks/useEventActions';

export default function EventsPage() {
  const navigate = useNavigate();
  const { isLoading, isError, loadingIds, handleJoin, handleLeave, handleRetry } =
    useEventActions();
  const events = useEventsStore((s) => s.events);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pageHeader = (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold">Public Events</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Find and join exciting events happening around you
      </p>
      <div className="relative mt-4 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );

  if (isLoading && events.length === 0) {
    return (
      <div className="py-8">
        {pageHeader}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Failed to load events.</p>
        <Button onClick={() => void handleRetry()}>Retry</Button>
      </div>
    );
  }

  if (!isLoading && !isError && events.length === 0) {
    return (
      <div className="py-8">
        {pageHeader}
        <EmptyState
          icon={CalendarDays}
          heading="No events yet"
          subText="Check back later for upcoming public events."
        />
      </div>
    );
  }

  return (
    <div className="py-8">
      {pageHeader}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((e) => (
          <EventCard
            key={e.id}
            id={e.id}
            title={e.title}
            description={e.description}
            dateTime={e.dateTime}
            location={e.location}
            capacity={e.capacity}
            participantCount={e.participantCount}
            isOrganizer={!!userId && e.organizerId === userId}
            onClick={() => void navigate(`/events/${e.id}`)}
            cta={
              <EventCta
                eventId={e.id}
                capacity={e.capacity}
                participantCount={e.participantCount}
                isJoined={e.isJoined}
                isAuthenticated={isAuthenticated}
                isInFlight={loadingIds.has(e.id)}
                isOrganizer={!!userId && e.organizerId === userId}
                onJoin={(id) => void handleJoin(id)}
                onLeave={(id) => void handleLeave(id)}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
