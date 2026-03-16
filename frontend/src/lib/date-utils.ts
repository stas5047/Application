import { isPast, parseISO } from 'date-fns';

export function isPastEvent(dateTime: string): boolean {
  return isPast(parseISO(dateTime));
}
