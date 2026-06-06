import { Card } from '../../../components/common/Card.tsx';
import { DurationBreakdown } from './DurationBreakdown.tsx';
import { formatNumber, type NormalizedStats } from './statsUtils.ts';

type MediaStatsPanelProps = {
  mediaType: 'movies' | 'series';
  stats: NormalizedStats;
};

function MetricTile({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="flex h-full flex-col rounded-[1.4rem] border border-border/70 bg-background/45 p-4">
      <p className="min-h-[2.5rem] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
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
        },
        {
          label: 'Movie watch time',
          value: `${formatNumber(stats.totalHours)}h`,
        },
      ]
    : [
        {
          label: 'Tracked series',
          value: formatNumber(stats.titleCount),
        },
        {
          label: 'Episodes watched',
          value: formatNumber(stats.episodesCount),
        },
        {
          label: 'Series watch time',
          value: `${formatNumber(stats.totalHours)}h`,
        },
      ];

  return (
    <Card tone="raised" className="flex h-full flex-col gap-5 border-border/80 bg-surface/90">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-h-[4.75rem]">
          <h2 className="text-xl font-semibold text-text">{titleLabel}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </div>

      <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metricTiles.map(tile => (
          <MetricTile key={tile.label} {...tile} />
        ))}
      </div>

      <div className="mt-auto">
        <DurationBreakdown duration={stats.duration} />
      </div>
    </Card>
  );
}
