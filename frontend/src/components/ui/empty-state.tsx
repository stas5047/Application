import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  subText: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon: Icon, heading, subText, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Icon className="size-12 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{heading}</h3>
        <p className="text-muted-foreground text-sm">{subText}</p>
      </div>
      {ctaLabel && onCta && (
        <Button variant="default" size="lg" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
