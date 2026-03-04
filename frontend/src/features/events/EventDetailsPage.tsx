import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, CalendarDays, MapPin, Pencil, Trash2, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useEventDetail } from '@/features/events/hooks/use-event-detail';
import { EventCta } from '@/features/events/components/EventCta';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ParticipantList } from '@/components/ui/participant-list';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-28" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="size-9 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
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
  } = useEventDetail(id ?? '');

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (isError || !event) {
    return (
      <EmptyState
        icon={AlertCircle}
        heading="Event not found"
        subText="This event may have been removed or the link is invalid."
        ctaLabel="Back to Events"
        onCta={() => void navigate('/events')}
      />
    );
  }

  const isOrganizer = user?.id === event.organizerId;
  const formattedDate = format(new Date(event.dateTime), "MMM d, yyyy 'at' h:mm a");
  const capacityText =
    event.capacity !== null
      ? `${event.participantCount} / ${event.capacity}`
      : `${event.participantCount} joined`;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigate('/events')}
              className="gap-1"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{event.title}</h1>
          </div>
          {isOrganizer && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void navigate(`/events/${event.id}/edit`)}
                className="gap-1"
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="gap-1"
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Two-column grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: meta + CTA */}
          <div className="space-y-6 lg:col-span-2">
            <div className="border-border bg-card space-y-4 rounded-lg border p-6">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="text-muted-foreground size-4 shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="text-muted-foreground size-4 shrink-0" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="text-muted-foreground size-4 shrink-0" />
                <span>{capacityText}</span>
              </div>
              {event.description && (
                <p className="text-muted-foreground border-border mt-4 border-t pt-4 text-sm leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
            <EventCta
              eventId={event.id}
              capacity={event.capacity}
              participantCount={event.participantCount}
              isJoined={event.isJoined}
              isAuthenticated={isAuthenticated}
              isInFlight={isInFlight}
              onJoin={() => void handleJoin()}
              onLeave={() => void handleLeave()}
            />
          </div>

          {/* Right: participants */}
          <div className="space-y-3">
            <h2 className="font-semibold">Participants</h2>
            <ParticipantList participants={event.participants} />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
