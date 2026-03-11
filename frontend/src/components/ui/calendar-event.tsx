import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getTagColor } from '@/lib/tag-colors';
import type { CalendarEventItem } from '@/types/calendar.types';

interface CalendarEventProps {
  event: CalendarEventItem;
}

export function CalendarEvent({ event }: CalendarEventProps) {
  const isOrganizer = event.role === 'organizer';
  const firstTag = event.tags?.[0];
  const tagColor = firstTag ? getTagColor(firstTag) : null;

  return (
    <div
      className={cn(
        'truncate rounded px-1.5 py-0.5 text-xs font-medium',
        tagColor
          ? `${tagColor.bg} ${tagColor.text}`
          : isOrganizer
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/40 text-primary',
      )}
    >
      <span className="mr-1 opacity-80">{format(event.start, 'h:mm a')}</span>
      <span className="truncate">{event.title}</span>
    </div>
  );
}
