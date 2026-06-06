import { Compass } from 'lucide-react';
import { ButtonLink } from '../../../components/common/ButtonLink.tsx';
import { Card } from '../../../components/common/Card.tsx';

export function StatsEmptyState() {
  return (
    <Card
      tone="raised"
      className="relative overflow-hidden border-primary/15 bg-surface/90"
    >
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-primary/80">Dashboard empty</p>
          <h2 className="mt-3 text-2xl font-semibold text-text">No watch history yet</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Mark movies or episodes as watched to see your statistics.
          </p>
        </div>
        <ButtonLink to="/browse" leadingIcon={<Compass className="h-4 w-4" aria-hidden="true" />}>
          Browse catalog
        </ButtonLink>
      </div>
    </Card>
  );
}
