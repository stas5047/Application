import { CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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

  if (isLoading && events.length === 0) {
    return (
      <div className="py-8">
        <h1 className="mb-6 text-2xl font-semibold">Public Events</h1>
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
        <h1 className="mb-6 text-2xl font-semibold">Public Events</h1>
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
      <h1 className="mb-6 text-2xl font-semibold">Public Events</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard
            key={e.id}
            id={e.id}
            title={e.title}
            description={e.description}
            dateTime={e.dateTime}
            location={e.location}
            capacity={e.capacity}
            participantCount={e.participantCount}
            onClick={() => void navigate(`/events/${e.id}`)}
            cta={
              <EventCta
                eventId={e.id}
                capacity={e.capacity}
                participantCount={e.participantCount}
                isJoined={e.isJoined}
                isAuthenticated={isAuthenticated}
                isInFlight={loadingIds.has(e.id)}
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
