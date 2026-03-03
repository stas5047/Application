import { Spinner } from '@/components/ui/spinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message }: PageLoaderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}
