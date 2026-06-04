import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Clapperboard, Clock, Film, Library, Tags, Tv } from 'lucide-react';
import { useGetMovieStatsQuery, useGetSeriesStatsQuery } from '../../../app/api/userStatsApi.ts';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Card } from '../../../components/ui/Card.tsx';

type StatItem = {
  label: string;
  value: number;
};

type StatsCardProps = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: StatItem[];
  topGenres: string[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
};

const numberFormatter = new Intl.NumberFormat();

function formatStatValue(value: number) {
  return numberFormatter.format(value);
}

function StatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl border border-border/70 bg-background/45" />
      ))}
    </div>
  );
}

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

const isUnauthorizedError = (error: unknown) => isFetchBaseQueryError(error) && error.status === 401;

const getStatsErrorMessage = (error: unknown) =>
  isUnauthorizedError(error)
    ? 'Session expired. Sign in again to load your statistics.'
    : 'Could not load these stats right now.';

function StatsCard({ title, subtitle, icon: Icon, items, topGenres, isLoading, isError, errorMessage }: StatsCardProps) {
  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <Badge tone={isError ? 'danger' : 'accent'}>{isError ? 'Unavailable' : 'Stats'}</Badge>
      </div>

      {isLoading ? (
        <StatsSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errorMessage}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map(item => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-background/45 p-4">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold text-text">{formatStatValue(item.value)}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2 text-sm font-medium text-muted">
              <Tags className="h-4 w-4" />
              Top genres
            </div>
            {topGenres.length > 0 ? (
              topGenres.map(genre => (
                <Badge key={genre} tone="default" className="tracking-normal normal-case">
                  {genre}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted">No genre data yet.</span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

export function ProfileStats() {
  const movieStatsQuery = useGetMovieStatsQuery();
  const seriesStatsQuery = useGetSeriesStatsQuery();
  const movieStats = movieStatsQuery.data;
  const seriesStats = seriesStatsQuery.data;
  const hasUnauthorizedStatsError =
    isUnauthorizedError(movieStatsQuery.error) || isUnauthorizedError(seriesStatsQuery.error);
  const hasCombinedStatsError = movieStatsQuery.isError || seriesStatsQuery.isError;
  const canShowCombinedStats = Boolean(movieStats && seriesStats) && !hasCombinedStatsError;
  const totalTitles = canShowCombinedStats ? (movieStats?.movieCount ?? 0) + (seriesStats?.tvSeriesCount ?? 0) : null;
  const totalHours = canShowCombinedStats ? (movieStats?.hoursWatched ?? 0) + (seriesStats?.hoursWatched ?? 0) : null;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-text">Profile Stats</h1>
        <p className="mt-1 text-sm text-muted">
          Your watched movies, series, and favorite genres. Hours, days, and months are backend-calculated values.
        </p>
      </div>
      {hasUnauthorizedStatsError ? (
        <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          Your session expired. Please sign in again.
        </div>
      ) : null}

      <StatsCard
        title="Movie Stats"
        subtitle="Completed movie watch time and genre activity."
        icon={Film}
        isLoading={movieStatsQuery.isLoading}
        isError={movieStatsQuery.isError}
        errorMessage={getStatsErrorMessage(movieStatsQuery.error)}
        topGenres={movieStats?.topGenres ?? []}
        items={[
          { label: 'Movies', value: movieStats?.movieCount ?? 0 },
          { label: 'Hours', value: movieStats?.hoursWatched ?? 0 },
          { label: 'Days', value: movieStats?.daysWatched ?? 0 },
          { label: 'Months', value: movieStats?.monthsWatched ?? 0 },
        ]}
      />

      <StatsCard
        title="Series Stats"
        subtitle="Series with watched episodes, watched episodes, and total watch time."
        icon={Tv}
        isLoading={seriesStatsQuery.isLoading}
        isError={seriesStatsQuery.isError}
        errorMessage={getStatsErrorMessage(seriesStatsQuery.error)}
        topGenres={seriesStats?.topGenres ?? []}
        items={[
          { label: 'Series', value: seriesStats?.tvSeriesCount ?? 0 },
          { label: 'Episodes', value: seriesStats?.episodesCount ?? 0 },
          { label: 'Hours', value: seriesStats?.hoursWatched ?? 0 },
          { label: 'Days', value: seriesStats?.daysWatched ?? 0 },
          { label: 'Months', value: seriesStats?.monthsWatched ?? 0 },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-4">
          <Clapperboard className="h-6 w-6 text-accent" />
          <div>
            <div className="text-sm text-muted">Total titles</div>
            <div className="text-xl font-semibold text-text">
              {totalTitles !== null ? formatStatValue(totalTitles) : 'N/A'}
            </div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Clock className="h-6 w-6 text-accent" />
          <div>
            <div className="text-sm text-muted">Total hours</div>
            <div className="text-xl font-semibold text-text">
              {totalHours !== null ? formatStatValue(totalHours) : 'N/A'}
            </div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Library className="h-6 w-6 text-accent" />
          <div>
            <div className="text-sm text-muted">Episodes watched</div>
            <div className="text-xl font-semibold text-text">{formatStatValue(seriesStats?.episodesCount ?? 0)}</div>
          </div>
        </Card>
      </div>
    </section>
  );
}
