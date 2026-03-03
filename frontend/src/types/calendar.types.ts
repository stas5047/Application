import type { EventRole } from '@/types/event.types';

export interface CalendarEventItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  role: EventRole;
}
