import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const;

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn(sizes[size], 'animate-spin text-muted-foreground', className)}
    />
  );
}
