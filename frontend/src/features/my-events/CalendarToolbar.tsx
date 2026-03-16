import { useContext } from 'react';
import { format, addDays, startOfWeek, startOfMonth, startOfDay, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import type { ToolbarProps } from 'react-big-calendar';
import { Button } from '@/components/ui/button';
import type { CalendarEventItem } from '@/types/calendar.types';
import { MyEventsContext } from './my-events.context';

const VIEW_LABELS: Record<string, string> = {
  month: 'Month',
  week: 'Week',
  agenda: 'Agenda',
};

export function CalendarToolbar({
  label,
  view,
  views,
  date,
  onNavigate,
  onView,
}: ToolbarProps<CalendarEventItem>) {
  const { showPast } = useContext(MyEventsContext);
  const today = new Date();

  // E2: dynamic agenda label "Mar 15 – Apr 13"
  const todayBtnLabel =
    view === 'agenda'
      ? `${format(today, 'MMM d')} – ${format(addDays(today, 29), 'MMM d')}`
      : view === 'month'
      ? 'This Month'
      : 'This Week';

  // E4: when showPast, disable the prev-disabled logic entirely
  let isPrevDisabled: boolean;
  if (showPast) {
    isPrevDisabled = false;
  } else if (view === 'month') {
    isPrevDisabled = !isAfter(startOfMonth(date), startOfMonth(today));
  } else if (view === 'week') {
    isPrevDisabled = !isAfter(
      startOfWeek(date, { weekStartsOn: 1 }),
      startOfWeek(today, { weekStartsOn: 1 }),
    );
  } else {
    isPrevDisabled = !isAfter(startOfDay(date), startOfDay(today));
  }

  const viewList = Array.isArray(views) ? views : Object.keys(views as object);

  return (
    <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-t-lg border border-b-0 px-4 py-2.5">
      {/* Left: nav */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onNavigate('PREV')}
          disabled={isPrevDisabled}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')} className="gap-1.5">
          <CalendarCheck className="size-3.5" />
          {todayBtnLabel}
        </Button>
        <Button variant="outline" size="icon" className="size-8" onClick={() => onNavigate('NEXT')}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Center: label */}
      <span className="text-sm font-semibold">{label}</span>

      {/* Right: view tabs */}
      <div className="flex gap-1">
        {viewList.map((v) => (
          <Button
            key={v}
            variant={view === v ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onView(v as typeof view)}
          >
            {VIEW_LABELS[v] ?? v}
          </Button>
        ))}
      </div>
    </div>
  );
}
