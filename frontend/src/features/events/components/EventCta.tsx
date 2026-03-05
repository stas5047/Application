import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface EventCtaProps {
  eventId: string;
  capacity: number | null;
  participantCount: number;
  isJoined: boolean;
  isAuthenticated: boolean;
  isInFlight: boolean;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
}

export function EventCta({
  eventId,
  capacity,
  participantCount,
  isJoined,
  isAuthenticated,
  isInFlight,
  onJoin,
  onLeave,
}: EventCtaProps) {
  const navigate = useNavigate();

  const isFull = capacity !== null && participantCount >= capacity;

  if (isFull && !isJoined) {
    return (
      <Button disabled onClick={(e) => e.stopPropagation()}>
        Full
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          void navigate('/login');
        }}
      >
        Sign in to join
      </Button>
    );
  }

  if (isInFlight) {
    return (
      <Button disabled onClick={(e) => e.stopPropagation()}>
        <Spinner size="sm" />
        Loading...
      </Button>
    );
  }

  if (isJoined) {
    return (
      <Button
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onLeave(eventId);
        }}
      >
        Leave
      </Button>
    );
  }

  return (
    <Button
      className="bg-green-500 hover:bg-green-600 text-white border-transparent"
      onClick={(e) => {
        e.stopPropagation();
        onJoin(eventId);
      }}
    >
      Join
    </Button>
  );
}
