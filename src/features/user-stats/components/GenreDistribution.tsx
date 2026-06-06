import { Tags } from 'lucide-react';
import { Card } from '../../../components/common/Card.tsx';
import { Badge } from '../../../components/common/Badge.tsx';

type GenreDistributionProps = {
  title: string;
  topGenres?: string[];
};

export function GenreDistribution({ title, topGenres = [] }: GenreDistributionProps) {
  return (
    <Card tone="raised" className="space-y-5 border-border/80 bg-surface/90">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text">{title}</h2>
          <p className="mt-1 text-sm text-muted">Genre names sent by backend for your watch history.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Tags className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {topGenres.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-background/35 px-5 py-8 text-sm text-muted">
          No genre data yet. Mark titles as watched to generate genre statistics.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {topGenres.map(genre => (
            <Badge key={genre} tone="default" className="px-3 py-1.5 normal-case tracking-normal">
              {genre}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
