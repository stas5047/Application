interface CapacityBarProps {
  participantCount: number;
  capacity: number | null;
}

export function CapacityBar({ participantCount, capacity }: CapacityBarProps) {
  if (capacity === null) return null;

  const pct = Math.min(Math.round((participantCount / capacity) * 100), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${participantCount} of ${capacity} spots filled`}
      className="w-full h-1.5 rounded-full bg-muted mt-0.5"
    >
      <div
        className="h-1.5 rounded-full bg-green-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}