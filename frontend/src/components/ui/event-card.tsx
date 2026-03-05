import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CapacityBar } from '@/components/ui/capacity-bar';
import { cn } from '@/lib/utils';

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  dateTime: string;
  location: string;
  capacity: number | null;
  participantCount: number;
  cta: React.ReactNode;
  onClick?: () => void;
}

export function EventCard({
  title,
  description,
  dateTime,
  location,
  capacity,
  participantCount,
  cta,
  onClick,
}: EventCardProps) {
  const date = new Date(dateTime);
  const participantText =
    capacity !== null ? `${participantCount} / ${capacity}` : `${participantCount} joined`;

  return (
    <Card
      className={cn(
        'group transition-all',
        onClick &&
          'cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-px',
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            'text-base leading-snug transition-colors',
            onClick && 'group-hover:text-primary',
          )}
        >
          {title}
        </CardTitle>
        {description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 pb-3">
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Calendar className="size-3.5 shrink-0" />
          <span>{format(date, 'MMM d, yyyy')}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Clock className="size-3.5 shrink-0" />
          <span>{format(date, 'h:mm a')}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Users className="size-3.5 shrink-0" />
          <span>{participantText}</span>
        </div>
        <CapacityBar participantCount={participantCount} capacity={capacity} />
      </CardContent>
      <CardFooter>{cta}</CardFooter>
    </Card>
  );
}
