import { BarChart3 } from 'lucide-react';
import { Card } from '../../../components/common/Card.tsx';
import { Badge } from '../../../components/common/Badge.tsx';
import { buildRankedGenres } from './statsUtils.ts';

type GenreDistributionProps = {
  title: string;
  topGenres?: string[];
};

export function GenreDistribution({ title, topGenres = [] }: GenreDistributionProps) {
  const genres = buildRankedGenres(topGenres);

  return (
    <Card tone="raised" className="space-y-5 border-border/80 bg-surface/90">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text">{title}</h2>
          <p className="mt-1 text-sm text-muted">A ranked view of the genres that surface most in your watch history.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {genres.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-background/35 px-5 py-8 text-sm text-muted">
          No genre data yet. Mark titles as watched to generate genre statistics.
        </div>
      ) : (
        <div className="space-y-4">
          {genres.map(genre => (
            <div key={genre.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge tone="default" className="min-w-12 justify-center px-2 tracking-[0.16em]">
                    #{genre.rank}
                  </Badge>
                  <span className="text-sm font-medium text-text">{genre.name}</span>
                </div>
                <span className="text-sm text-muted">{genre.percentage}% rank weight</span>
              </div>
              <div className="h-2 rounded-full bg-background/75">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-primary/65"
                  style={{ width: `${Math.max(genre.percentage ?? 0, 12)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
