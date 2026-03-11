import { useEffect, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { tagsService } from '@/services/tags.service';
import type { TagResponse } from '@/types/tag.types';

interface TagMultiSelectProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  disabled?: boolean;
}

export function TagMultiSelect({
  id,
  value,
  onChange,
  maxTags = 5,
  disabled = false,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagResponse[]>([]);

  useEffect(() => {
    tagsService
      .getAll()
      .then(setAvailableTags)
      .catch(() => toast.error('Failed to load tags'));
  }, []);

  const atMax = value.length >= maxTags;

  function toggleTag(name: string) {
    if (value.includes(name)) {
      onChange(value.filter((t) => t !== name));
    } else {
      if (atMax) return;
      onChange([...value, name]);
    }
  }

  function removeTag(e: React.MouseEvent, name: string) {
    e.stopPropagation();
    onChange(value.filter((t) => t !== name));
  }

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            open && 'ring-2 ring-ring ring-offset-2',
          )}
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground">Select tags…</span>
          ) : (
            value.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
                <button
                  type="button"
                  className="rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                  onClick={(e) => removeTag(e, tag)}
                  aria-label={`Remove ${tag}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))
          )}
          <span className="ml-auto flex items-center gap-1.5 pl-1">
            <span className="text-xs text-muted-foreground">
              {value.length} / {maxTags}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180',
              )}
            />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search tags…" />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {availableTags.map((tag) => {
                const selected = value.includes(tag.name);
                const itemDisabled = !selected && atMax;
                return (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    disabled={itemDisabled}
                    onSelect={() => toggleTag(tag.name)}
                    className={cn(selected && 'bg-accent text-accent-foreground')}
                  >
                    {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
                    {selected && <Check className="ml-auto size-4" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
