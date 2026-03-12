import { Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/ui/event-card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { EventCta } from '@/features/events/components/EventCta';
import { useRecommendations } from './use-recommendations';

const getMatchBadgeClass = (score: number) =>
  score >= 0.7
    ? 'bg-green-100 text-green-800 border border-green-200'
    : score >= 0.4
      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      : 'bg-gray-100 text-gray-600 border border-gray-200';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { recommendations, isLoading, isError, loadingIds, handleJoin, handleLeave, handleRetry } =
    useRecommendations();

  const isColdStart =
    recommendations.length > 0 && recommendations.every((r) => r.matchScore === 0);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Failed to load recommendations.</p>
        <Button onClick={() => void handleRetry()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Recommendations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Events tailored to your interests</p>
      </div>

      {/* Cold-start banner */}
      {isColdStart && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <p className="text-sm text-blue-800">
            Join some events first to get personalized recommendations. Showing popular events in
            the meantime.
          </p>
        </div>
      )}

      {/* Empty state */}
      {recommendations.length === 0 && (
        <EmptyState
          icon={Sparkles}
          heading="No recommendations available right now."
          subText="Check back after joining some events — we'll find the best matches for your interests."
        />
      )}

      {/* Grid */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="relative h-full">
              {rec.matchScore > 0 && (
                <Badge
                  className={cn(
                    'absolute right-2 top-2 z-10 rounded-full text-xs font-semibold',
                    getMatchBadgeClass(rec.matchScore),
                  )}
                >
                  Match: {Math.round(rec.matchScore * 100)}%
                </Badge>
              )}
              <EventCard
                id={rec.id}
                title={rec.title}
                description={rec.description}
                dateTime={rec.dateTime}
                location={rec.location}
                capacity={rec.capacity}
                participantCount={rec.participantCount}
                isOrganizer={false}
                tags={rec.tags}
                onClick={() => void navigate(`/events/${rec.id}`)}
                cta={
                  <EventCta
                    eventId={rec.id}
                    capacity={rec.capacity}
                    participantCount={rec.participantCount}
                    isJoined={rec.isJoined}
                    isAuthenticated={true}
                    isInFlight={loadingIds.has(rec.id)}
                    isOrganizer={false}
                    onJoin={(id) => void handleJoin(id)}
                    onLeave={(id) => void handleLeave(id)}
                  />
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
