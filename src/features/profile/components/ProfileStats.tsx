import type {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {Clapperboard, Clock, Film, Library, Tv} from 'lucide-react';
import {useGetMovieStatsQuery, useGetSeriesStatsQuery} from '../../user-stats/api/userStatsApi.ts';
import {Card} from '../../../components/common/Card.tsx';
import {formatStatValue, StatsCard} from "./StatsCard";

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

const isUnauthorizedError = (error: unknown) => isFetchBaseQueryError(error) && error.status === 401;

const getStatsErrorMessage = (error: unknown) =>
  isUnauthorizedError(error)
    ? 'Session expired. Sign in again to load your statistics.'
    : 'Could not load these stats right now.';

type SummaryStatCardProps = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'count' | 'time';
};

function SummaryStatCard({label, value, icon: Icon, variant = 'count'}: SummaryStatCardProps) {
  const isTime = variant === 'time';

  return (
    <Card
      className={
        isTime
          ? 'flex items-center gap-4 rounded-[1.75rem] border-border/70 bg-background/70'
          : 'flex items-center gap-4 rounded-[1.75rem] border-primary/20 bg-linear-to-br from-primary/12 via-primary/5 to-background/95 shadow-[0_20px_44px_-28px_var(--color-primary)]'
      }
    >
      <div
        className={
          isTime
            ? 'flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-muted'
            : 'flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary'
        }
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className={isTime ? 'text-[0.72rem] font-medium uppercase tracking-[0.22em] text-muted' : 'text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-primary/80'}>
          {label}
        </div>
        <div className={isTime ? 'mt-2 text-2xl font-medium text-text/92' : 'mt-2 text-3xl font-semibold leading-none text-text'}>
          {value}
        </div>
      </div>
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
        countItems={[
          { label: 'Movies', value: movieStats?.movieCount ?? 0 },
        ]}
        timeItems={[
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
        countItems={[
          { label: 'Series', value: seriesStats?.tvSeriesCount ?? 0 },
          { label: 'Episodes', value: seriesStats?.episodesCount ?? 0 },
        ]}
        timeItems={[
          { label: 'Hours', value: seriesStats?.hoursWatched ?? 0 },
          { label: 'Days', value: seriesStats?.daysWatched ?? 0 },
          { label: 'Months', value: seriesStats?.monthsWatched ?? 0 },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryStatCard
          label="Total titles"
          value={totalTitles !== null ? formatStatValue(totalTitles) : 'N/A'}
          icon={Clapperboard}
        />
        <SummaryStatCard
          label="Total hours"
          value={totalHours !== null ? formatStatValue(totalHours) : 'N/A'}
          icon={Clock}
          variant="time"
        />
        <SummaryStatCard
          label="Episodes watched"
          value={formatStatValue(seriesStats?.episodesCount ?? 0)}
          icon={Library}
        />
      </div>
    </section>
  );
}
