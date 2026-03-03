import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

function CapacityBadge({
  capacity,
  participantCount,
}: {
  capacity: number | null;
  participantCount: number;
}) {
  if (capacity === null) {
    return <Badge variant="secondary">Unlimited</Badge>;
  }
  if (participantCount >= capacity) {
    return <Badge variant="destructive">Full</Badge>;
  }
  return <Badge variant="secondary">{participantCount}/{capacity}</Badge>;
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

  return (
    <Card
      className={onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : undefined}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{title}</CardTitle>
          <CapacityBadge capacity={capacity} participantCount={participantCount} />
        </div>
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
          <span>{participantCount} joined</span>
        </div>
      </CardContent>
      <CardFooter>{cta}</CardFooter>
    </Card>
  );
}
