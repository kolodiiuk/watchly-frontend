import { numberFormatter } from '../../../utils/formatters.ts';
import type { MovieStatsResponse, SeriesStatsResponse } from '../models/UserStats.ts';

export type DurationParts = {
  months: number;
  days: number;
  hours: number;
};

export type NormalizedStats = {
  titleCount: number;
  episodesCount: number;
  totalHours: number;
  duration: DurationParts;
  topGenres: string[];
};

const HOURS_IN_DAY = 24;
const DAYS_IN_MONTH = 30;
const HOURS_IN_MONTH = HOURS_IN_DAY * DAYS_IN_MONTH;

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function deriveDurationParts(months: number, days: number, hours: number): DurationParts {
  const looksCumulative = hours >= days * HOURS_IN_DAY || days >= months * DAYS_IN_MONTH;

  if (looksCumulative) {
    return {
      months,
      days: Math.max(days - months * DAYS_IN_MONTH, 0),
      hours: Math.max(hours - days * HOURS_IN_DAY, 0),
    };
  }

  return { months, days, hours };
}

export function getTotalHours(duration: DurationParts) {
  return duration.months * HOURS_IN_MONTH + duration.days * HOURS_IN_DAY + duration.hours;
}

export function formatDuration(duration: DurationParts) {
  return `${formatNumber(duration.months)} month${duration.months === 1 ? '' : 's'} · ${formatNumber(duration.days)} day${duration.days === 1 ? '' : 's'} · ${formatNumber(duration.hours)} hour${duration.hours === 1 ? '' : 's'}`;
}

export function normalizeMovieStats(stats?: MovieStatsResponse | null): NormalizedStats {
  const duration = deriveDurationParts(stats?.monthsWatched ?? 0, stats?.daysWatched ?? 0, stats?.hoursWatched ?? 0);

  return {
    titleCount: stats?.movieCount ?? 0,
    episodesCount: 0,
    totalHours: getTotalHours(duration),
    duration,
    topGenres: stats?.topGenres ?? [],
  };
}

export function normalizeSeriesStats(stats?: SeriesStatsResponse | null): NormalizedStats {
  const duration = deriveDurationParts(stats?.monthsWatched ?? 0, stats?.daysWatched ?? 0, stats?.hoursWatched ?? 0);

  return {
    titleCount: stats?.tvSeriesCount ?? 0,
    episodesCount: stats?.episodesCount ?? 0,
    totalHours: getTotalHours(duration),
    duration,
    topGenres: stats?.topGenres ?? [],
  };
}
export function buildRankedGenres(topGenres: string[]) {
  const maxRank = Math.max(topGenres.length, 1);

  return topGenres.map((name, index) => ({
    name,
    count: null,
    percentage: Math.round(((maxRank - index) / maxRank) * 100),
    rank: index + 1,
  }));
}
