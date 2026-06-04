import { baseApi } from './baseApi.ts';
import type {WatchStatus} from '../models/WatchStatus.ts';

export interface EpisodeWatchInfo {
  episodeId: number;
  count: number;
}

export interface TvShowWatchInfo {
  tvShowId: number;
  episodeWatchInfos: EpisodeWatchInfo[];
}

export interface SetTitleWatchStatusRequest {
  status: WatchStatus;
}

const watchTrackingTag = (id: string) => ({ type: 'WatchTracking' as const, id });

export const watchTrackingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMovieWatchCount: builder.query<number, number>({
      query: movieId => ({ url: `track/movie/${movieId}`, method: 'GET' }),
      providesTags: (_result, _error, movieId) => [watchTrackingTag(`movie-${movieId}`)],
    }),

    getEpisodeWatchCount: builder.query<number, number>({
      query: episodeId => ({ url: `track/episode/${episodeId}`, method: 'GET' }),
      providesTags: (_result, _error, episodeId) => [watchTrackingTag(`episode-${episodeId}`)],
    }),

    getTvShowWatchInfo: builder.query<TvShowWatchInfo, number>({
      query: tvShowId => ({ url: `track/tv-show/${tvShowId}`, method: 'GET' }),
      providesTags: (_result, _error, tvShowId) => [
        watchTrackingTag(`tv-show-${tvShowId}`),
        watchTrackingTag('tv-show-list'),
      ],
    }),

    getTitleWatchStatus: builder.query<WatchStatus, number>({
      query: titleId => ({ url: `track/title/${titleId}/status`, method: 'GET' }),
      providesTags: (_result, _error, titleId) => [watchTrackingTag(`title-status-${titleId}`)],
    }),

    incrementMovieWatchCount: builder.mutation<void, number>({
      query: movieId => ({ url: `track/movie/incr/${movieId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, movieId) => [watchTrackingTag(`movie-${movieId}`), 'UserStats'],
    }),

    incrementEpisodeWatchCount: builder.mutation<void, number>({
      query: episodeId => ({ url: `track/episode/incr/${episodeId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, episodeId) => [watchTrackingTag(`episode-${episodeId}`), 'UserStats'],
    }),

    incrementSeasonWatchCount: builder.mutation<void, number>({
      query: seasonId => ({ url: `track/season/incr/${seasonId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, seasonId) => [
        watchTrackingTag(`season-${seasonId}`),
        watchTrackingTag('tv-show-list'),
        'UserStats',
      ],
    }),

    decrementMovieWatchCount: builder.mutation<void, number>({
      query: movieId => ({ url: `track/movie/decr/${movieId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, movieId) => [watchTrackingTag(`movie-${movieId}`), 'UserStats'],
    }),

    decrementEpisodeWatchCount: builder.mutation<void, number>({
      query: episodeId => ({ url: `track/episode/decr/${episodeId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, episodeId) => [watchTrackingTag(`episode-${episodeId}`), 'UserStats'],
    }),

    decrementSeasonWatchCount: builder.mutation<void, number>({
      query: seasonId => ({ url: `track/season/decr/${seasonId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, seasonId) => [
        watchTrackingTag(`season-${seasonId}`),
        watchTrackingTag('tv-show-list'),
        'UserStats',
      ],
    }),

    setTitleWatchStatus: builder.mutation<void, { titleId: number; status: WatchStatus }>({
      query: ({ titleId, status }) => ({
        url: `track/title/${titleId}/status`,
        method: 'PUT',
        body: { status } satisfies SetTitleWatchStatusRequest,
      }),
      invalidatesTags: (_result, _error, { titleId }) => [watchTrackingTag(`title-status-${titleId}`), 'UserStats'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMovieWatchCountQuery,
  useGetEpisodeWatchCountQuery,
  useGetTvShowWatchInfoQuery,
  useIncrementMovieWatchCountMutation,
  useIncrementEpisodeWatchCountMutation,
  useIncrementSeasonWatchCountMutation,
  useDecrementMovieWatchCountMutation,
  useDecrementEpisodeWatchCountMutation,
  useDecrementSeasonWatchCountMutation,
  useGetTitleWatchStatusQuery,
  useSetTitleWatchStatusMutation,
} = watchTrackingApi;
