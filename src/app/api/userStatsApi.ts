import { baseApi } from './baseApi.ts';
import type { MovieStatsResponse, SeriesStatsResponse } from '../models/UserStats.ts';

type RawMovieStatsResponse = Partial<MovieStatsResponse> & {
  MovieCount?: number;
  DaysWatched?: number;
  HoursWatched?: number;
  MonthsWatched?: number;
  TopGenres?: string[];
};

type RawSeriesStatsResponse = Partial<SeriesStatsResponse> & {
  TvSeriesCount?: number;
  EpisodesCount?: number;
  DaysWatched?: number;
  HoursWatched?: number;
  MonthsWatched?: number;
  TopGenres?: string[];
};

const normalizeGenres = (genres?: Iterable<string>) => Array.from(genres ?? []);

const normalizeMovieStats = (response: RawMovieStatsResponse): MovieStatsResponse => ({
  movieCount: response.movieCount ?? response.MovieCount ?? 0,
  daysWatched: response.daysWatched ?? response.DaysWatched ?? 0,
  hoursWatched: response.hoursWatched ?? response.HoursWatched ?? 0,
  monthsWatched: response.monthsWatched ?? response.MonthsWatched ?? 0,
  topGenres: normalizeGenres(response.topGenres ?? response.TopGenres),
});

const normalizeSeriesStats = (response: RawSeriesStatsResponse): SeriesStatsResponse => ({
  tvSeriesCount: response.tvSeriesCount ?? response.TvSeriesCount ?? 0,
  episodesCount: response.episodesCount ?? response.EpisodesCount ?? 0,
  daysWatched: response.daysWatched ?? response.DaysWatched ?? 0,
  hoursWatched: response.hoursWatched ?? response.HoursWatched ?? 0,
  monthsWatched: response.monthsWatched ?? response.MonthsWatched ?? 0,
  topGenres: normalizeGenres(response.topGenres ?? response.TopGenres),
});

export const userStatsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMovieStats: builder.query<MovieStatsResponse, void>({
      query: () => ({ url: 'userstats/movie', method: 'GET' }),
      transformResponse: normalizeMovieStats,
      providesTags: ['UserStats'],
    }),
    getSeriesStats: builder.query<SeriesStatsResponse, void>({
      query: () => ({ url: 'userstats/series', method: 'GET' }),
      transformResponse: normalizeSeriesStats,
      providesTags: ['UserStats'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMovieStatsQuery, useGetSeriesStatsQuery } = userStatsApi;
