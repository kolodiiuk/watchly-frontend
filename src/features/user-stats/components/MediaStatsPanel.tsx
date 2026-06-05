import { Badge } from '../../../components/common/Badge.tsx';
import { Card } from '../../../components/common/Card.tsx';
import { DurationBreakdown } from './DurationBreakdown.tsx';
import { formatNumber, type NormalizedStats } from './statsUtils.ts';

type MediaStatsPanelProps = {
  mediaType: 'movies' | 'series';
  stats: NormalizedStats;
};

function MetricTile({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-[1.4rem] border border-border/70 bg-background/45 p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

export function MediaStatsPanel({ mediaType, stats }: MediaStatsPanelProps) {
  const isMoviePanel = mediaType === 'movies';
  const titleLabel = isMoviePanel ? 'Movies' : 'Series';
  const description = isMoviePanel
    ? 'Watch totals, ranked genres, and duration for your completed movies.'
    : 'Episode volume, watch time, and series progress summary.';
  const metricTiles = isMoviePanel
    ? [
        {
          label: 'Watched movies',
          value: formatNumber(stats.titleCount),
          subtitle: 'Distinct titles completed',
        },
        {
          label: 'Movie watch time',
          value: `${formatNumber(stats.totalHours)}h`,
          subtitle: 'Total movie watch time',
        },
      ]
    : [
        {
          label: 'Tracked series',
          value: formatNumber(stats.titleCount),
          subtitle: 'Series with watched episodes',
        },
        {
          label: 'Episodes watched',
          value: formatNumber(stats.episodesCount),
          subtitle: 'Episodes completed or replayed',
        },
        {
          label: 'Series watch time',
          value: `${formatNumber(stats.totalHours)}h`,
          subtitle: 'Total series watch time',
        },
      ];

  return (
    <Card tone="raised" className="space-y-5 border-border/80 bg-surface/90">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text">{titleLabel}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <Badge tone="accent" className="tracking-[0.2em]">
          {isMoviePanel ? 'Film View' : 'Series View'}
        </Badge>
      </div>

      <div className={`grid gap-3 ${isMoviePanel ? 'md:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
        {metricTiles.map(tile => (
          <MetricTile key={tile.label} {...tile} />
        ))}
      </div>

      <DurationBreakdown duration={stats.duration} />
    </Card>
  );
}
