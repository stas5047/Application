import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEventItem } from '@/types/calendar.types';

interface CalendarEventProps {
  event: CalendarEventItem;
}

export function CalendarEvent({ event }: CalendarEventProps) {
  const isOrganizer = event.role === 'organizer';

  return (
    <div
      className={cn(
        'truncate rounded px-1.5 py-0.5 text-xs font-medium',
        isOrganizer
          ? 'bg-primary text-primary-foreground'
          : 'bg-indigo-500 text-white',
      )}
    >
      <span className="mr-1 opacity-80">{format(event.start, 'h:mm')}</span>
      <span className="truncate">{event.title}</span>
    </div>
  );
}
