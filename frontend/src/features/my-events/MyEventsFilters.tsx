import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TagFilter } from '@/features/events/components/TagFilter';

export type RoleFilter = 'all' | 'organizer' | 'participant';
export type VisibilityFilter = 'all' | 'public' | 'private';

interface MyEventsFiltersProps {
  roleFilter: RoleFilter;
  onRoleChange: (v: RoleFilter) => void;
  visibilityFilter: VisibilityFilter;
  onVisibilityChange: (v: VisibilityFilter) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  showPast: boolean;
  onShowPastChange: (v: boolean) => void;
}

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'participant', label: 'Participant' },
];

const VIS_OPTIONS: { value: VisibilityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="bg-muted flex gap-0.5 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
            value === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function MyEventsFilters({
  roleFilter,
  onRoleChange,
  visibilityFilter,
  onVisibilityChange,
  selectedTags,
  onTagsChange,
  showPast,
  onShowPastChange,
}: MyEventsFiltersProps) {
  return (
    <div className="border-border bg-card mb-2.5 flex flex-col gap-2.5 rounded-lg border px-4 py-3">
      {/* Row 1: Role + Visibility + Show Past */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold">Role</span>
          <ToggleGroup options={ROLE_OPTIONS} value={roleFilter} onChange={onRoleChange} />
        </div>
        <div className="bg-border h-5 w-px" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold">Visibility</span>
          <ToggleGroup options={VIS_OPTIONS} value={visibilityFilter} onChange={onVisibilityChange} />
        </div>
        <div className="bg-border h-5 w-px" />
        <Button
          variant={showPast ? 'default' : 'outline'}
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => onShowPastChange(!showPast)}
        >
          {showPast ? 'Hide past events' : 'Show past events'}
        </Button>
      </div>

      {/* Row 2: Tag filter */}
      <TagFilter selectedTags={selectedTags} onTagsChange={onTagsChange} />
    </div>
  );
}
