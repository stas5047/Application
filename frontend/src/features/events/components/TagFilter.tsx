import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTagColor } from '@/lib/tag-colors';
import { tagsService } from '@/services/tags.service';
import type { TagResponse } from '@/types/tag.types';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [tags, setTags] = useState<TagResponse[]>([]);

  useEffect(() => {
    tagsService
      .getAll()
      .then(setTags)
      .catch(() => toast.error('Failed to load tags'));
  }, []);

  function toggleTag(name: string) {
    if (selectedTags.includes(name)) {
      onTagsChange(selectedTags.filter((t) => t !== name));
    } else {
      onTagsChange([...selectedTags, name]);
    }
  }

  if (tags.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-nowrap items-center gap-2 pb-1">
        {tags.map((tag) => {
          const active = selectedTags.includes(tag.name);
          const color = getTagColor(tag.name);
          return (
            <Badge
              key={tag.id}
              variant={active ? undefined : 'outline'}
              className={cn(
                'cursor-pointer select-none whitespace-nowrap',
                active && `${color.bg} ${color.text} border-transparent`,
              )}
              onClick={() => toggleTag(tag.name)}
            >
              {tag.name}
            </Badge>
          );
        })}
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => onTagsChange([])}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
