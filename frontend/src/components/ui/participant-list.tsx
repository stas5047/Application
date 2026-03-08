import { cn } from '@/lib/utils';
import type { EventParticipant } from '@/types/event.types';

interface ParticipantListProps {
  participants: EventParticipant[];
  maxVisible?: number;
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-yellow-500',
  'bg-red-500',
] as const;

function getAvatarColor(username: string): string {
  const index = username.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

export function ParticipantList({ participants, maxVisible = 12 }: ParticipantListProps) {
  const visible = participants.slice(0, maxVisible);
  const overflow = participants.length - maxVisible;

  if (participants.length === 0) {
    return <p className="text-muted-foreground text-sm">No participants yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((participant) => (
        <div
          key={participant.id}
          title={participant.username}
          className={cn(
            'flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white',
            getAvatarColor(participant.username),
          )}
        >
          {getInitials(participant.username)}
        </div>
      ))}
      {overflow > 0 && (
        <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full text-xs font-semibold">
          +{overflow}
        </div>
      )}
    </div>
  );
}
