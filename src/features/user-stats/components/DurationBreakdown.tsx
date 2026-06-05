import { Clock3 } from 'lucide-react';
import { formatDuration, formatNumber, type DurationParts } from './statsUtils.ts';

type DurationBreakdownProps = {
  duration: DurationParts;
};

export function DurationBreakdown({ duration }: DurationBreakdownProps) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background/40 p-4">
      <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted">
        <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
        Duration
      </div>
      <p className="mt-3 text-lg font-medium text-text">{formatDuration(duration)}</p>
      <p className="mt-2 text-sm text-muted">
        {formatNumber(duration.months)} months logged across full months, {formatNumber(duration.days)} remaining days,
        and {formatNumber(duration.hours)} remaining hours.
      </p>
    </div>
  );
}
