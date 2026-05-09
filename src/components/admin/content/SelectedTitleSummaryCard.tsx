import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface SelectedTitleSummaryCardProps {
  name?: string;
  type?: 'movie' | 'series';
}

export function SelectedTitleSummaryCard({ name = 'Selected title', type = 'series' }: SelectedTitleSummaryCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/70 p-4">
      <div>
        <p className="text-sm font-semibold text-text">{name}</p>
        <Badge className="mt-2" tone={type === 'series' ? 'warning' : 'accent'}>
          {type}
        </Badge>
      </div>
      <Button variant="secondary">Back to titles</Button>
    </div>
  );
}
