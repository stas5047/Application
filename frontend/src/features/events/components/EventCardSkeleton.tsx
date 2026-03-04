import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EventCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 pb-3">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}
