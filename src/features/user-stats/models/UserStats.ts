export interface MovieStatsResponse {
  movieCount: number;
  daysWatched: number;
  hoursWatched: number;
  monthsWatched: number;
  topGenres: string[];
}

export interface SeriesStatsResponse {
  tvSeriesCount: number;
  episodesCount: number;
  daysWatched: number;
  hoursWatched: number;
  monthsWatched: number;
  topGenres: string[];
}
