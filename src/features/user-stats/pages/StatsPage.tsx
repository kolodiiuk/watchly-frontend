import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Activity, Clapperboard, Clock3, Film, Tv2 } from 'lucide-react';
import { Card } from '../../../components/common/Card.tsx';
import { useGetMovieStatsQuery, useGetSeriesStatsQuery } from '../api/userStatsApi.ts';
import { GenreDistribution } from '../components/GenreDistribution.tsx';
import { MediaStatsTabs } from '../components/MediaStatsTabs.tsx';
import { StatsEmptyState } from '../components/StatsEmptyState.tsx';
import { StatsOverview } from '../components/StatsOverview.tsx';
import { formatNumber, normalizeMovieStats, normalizeSeriesStats } from '../components/statsUtils.ts';

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

const isUnauthorizedError = (error: unknown) => isFetchBaseQueryError(error) && error.status === 401;

function StatsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl border border-border/70 bg-surface/65" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-3xl border border-border/70 bg-surface/65" />
        ))}
      </div>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{message}</div>
  );
}

export function StatsPage() {
  const movieStatsQuery = useGetMovieStatsQuery();
  const seriesStatsQuery = useGetSeriesStatsQuery();

  const hasUnauthorizedStatsError =
    isUnauthorizedError(movieStatsQuery.error) || isUnauthorizedError(seriesStatsQuery.error);
  const hasLoadingState = movieStatsQuery.isLoading || seriesStatsQuery.isLoading;
  const hasBlockingError = movieStatsQuery.isError || seriesStatsQuery.isError;

  if (hasUnauthorizedStatsError) {
    return (
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">Stats</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Your watch history, genre activity, and progress overview.
          </p>
        </div>
        <ErrorNotice message="Your session expired. Please sign in again to load your statistics." />
      </section>
    );
  }

  if (hasLoadingState) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-text">Stats</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Your watch history, genre activity, and progress overview.
          </p>
        </div>
        <StatsSkeleton />
      </section>
    );
  }

  if (hasBlockingError) {
    return (
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">Stats</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Your watch history, genre activity, and progress overview.
          </p>
        </div>
        <ErrorNotice message="Could not load your statistics right now." />
      </section>
    );
  }

  const movieStats = normalizeMovieStats(movieStatsQuery.data);
  const seriesStats = normalizeSeriesStats(seriesStatsQuery.data);
  const totalTitles = movieStats.titleCount + seriesStats.titleCount;
  const totalHours = movieStats.totalHours + seriesStats.totalHours;
  const episodesWatched = seriesStats.episodesCount;
  const hasAnyWatchActivity = totalTitles > 0 || totalHours > 0 || episodesWatched > 0;

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-br from-surface-raised/92 via-surface/88 to-background-alt/88 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.22)] sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,0.10),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(99,215,207,0.08),transparent_28%)]"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/80">Analytics</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">Stats</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Your watch history, genre activity, and progress overview.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[30rem]">
            <Card className="border-border/70 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                <Film className="h-4 w-4 text-primary" aria-hidden="true" />
                Movies
              </div>
              <p className="mt-2 text-xl font-semibold text-text">{formatNumber(movieStats.titleCount)}</p>
            </Card>
            <Card className="border-border/70 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                <Tv2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Series
              </div>
              <p className="mt-2 text-xl font-semibold text-text">{formatNumber(seriesStats.titleCount)}</p>
            </Card>
            <Card className="border-border/70 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                <Activity className="h-4 w-4 text-accent" aria-hidden="true" />
                Episodes
              </div>
              <p className="mt-2 text-xl font-semibold text-text">{formatNumber(episodesWatched)}</p>
            </Card>
          </div>
        </div>
      </div>

      <StatsOverview
        items={[
          {
            label: 'Total titles watched',
            value: formatNumber(totalTitles),
            subtitle: 'Movies and series with recorded watch activity',
            icon: <Clapperboard className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: 'Total watch time',
            value: `${formatNumber(totalHours)}h`,
            subtitle: 'Combined watch time across movies and series',
            icon: <Clock3 className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: 'Episodes watched',
            value: formatNumber(episodesWatched),
            subtitle: 'Series progress tracked through watched episodes',
            icon: <Tv2 className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: 'Movies watched',
            value: formatNumber(movieStats.titleCount),
            subtitle: 'Completed movie titles in your history',
            icon: <Film className="h-5 w-5" aria-hidden="true" />,
          },
        ]}
      />

      {!hasAnyWatchActivity ? <StatsEmptyState /> : null}

      <MediaStatsTabs movieStats={movieStats} seriesStats={seriesStats} />

      <div className="grid gap-4 xl:grid-cols-2">
        <GenreDistribution
          title="Movie genres"
          topGenres={movieStats.topGenres}
        />
        <GenreDistribution
          title="Series genres"
          topGenres={seriesStats.topGenres}
        />
      </div>

      <Card tone="raised" className="space-y-4 border-border/80 bg-surface/90">
        <div>
          <h2 className="text-xl font-semibold text-text">Series overview</h2>
          <p className="mt-1 text-sm text-muted">A concise summary based on the series data currently returned by the API.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/70 bg-background/40 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">Tracked series</p>
            <p className="mt-2 text-2xl font-semibold text-text">{formatNumber(seriesStats.titleCount)}</p>
          </Card>
          <Card className="border-border/70 bg-background/40 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">Episodes watched</p>
            <p className="mt-2 text-2xl font-semibold text-text">{formatNumber(seriesStats.episodesCount)}</p>
          </Card>
          <Card className="border-border/70 bg-background/40 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">Series watch time</p>
            <p className="mt-2 text-2xl font-semibold text-text">{formatNumber(seriesStats.totalHours)}h</p>
          </Card>
        </div>
      </Card>
    </section>
  );
}
