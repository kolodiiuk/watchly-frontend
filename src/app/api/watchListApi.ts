import { baseApi } from './baseApi.ts';
import type { TitleShortInfo } from '../models/TitleInfo.tsx';
import type { WatchListInfo, WatchListShortInfo } from '../models/WatchListInfo.ts';

export interface WatchListTitleRequest {
  watchListId: number;
  titleId: number;
}

export interface RenameWatchListRequest {
  watchListId: number;
  newName: string;
}

export const watchListApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    addTitleToDefaultWatchList: builder.mutation<void, number>({
      query: titleId => ({
        url: `watchList/${titleId}`,
        method: 'POST',
      }),
    }),

    removeTitleFromDefaultWatchList: builder.mutation<void, number>({
      query: titleId => ({
        url: `watchList/${titleId}`,
        method: 'DELETE',
      }),
    }),

    createCustomWatchList: builder.mutation<void, string>({
      query: name => ({
        url: `watchList/new/${encodeURIComponent(name)}`,
        method: 'POST',
      }),
    }),

    addTitleToWatchListById: builder.mutation<void, WatchListTitleRequest>({
      query: ({ watchListId, titleId }) => ({
        url: `watchList/${watchListId}/title/${titleId}`,
        method: 'POST',
      }),
    }),

    removeTitleFromWatchListById: builder.mutation<void, WatchListTitleRequest>({
      query: ({ watchListId, titleId }) => ({
        url: `watchList/${watchListId}/title/${titleId}`,
        method: 'DELETE',
      }),
    }),

    deleteCustomWatchList: builder.mutation<void, number>({
      query: watchListId => ({
        url: `watchList/delete/${watchListId}`,
        method: 'DELETE',
      }),
    }),

    renameCustomWatchList: builder.mutation<void, RenameWatchListRequest>({
      query: ({ watchListId, newName }) => ({
        url: `watchList/${watchListId}/${encodeURIComponent(newName)}`,
        method: 'PATCH',
      }),
    }),

    getTitlesInDefaultWatchList: builder.query<TitleShortInfo[], void>({
      query: () => ({
        url: 'watchList/titles',
        method: 'GET',
      }),
    }),

    getTitlesInWatchListById: builder.query<TitleShortInfo[], number>({
      query: watchListId => ({
        url: `watchList/titles/${watchListId}`,
        method: 'GET',
      }),
    }),

    getUserWatchLists: builder.query<WatchListInfo[], void>({
      query: () => ({
        url: 'watchList/lists',
        method: 'GET',
      }),
    }),

    getWatchListsWithTitle: builder.query<WatchListShortInfo[], number>({
      query: titleId => ({
        url: `watchList/lists/${titleId}`,
        method: 'GET',
      }),
    }),

    clearDefaultWatchList: builder.mutation<void, void>({
      query: () => ({
        url: 'watchList/clear',
        method: 'DELETE',
      }),
    }),

    clearWatchListById: builder.mutation<void, number>({
      query: watchListId => ({
        url: `watchList/clear/${watchListId}`,
        method: 'DELETE',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddTitleToDefaultWatchListMutation,
  useRemoveTitleFromDefaultWatchListMutation,
  useCreateCustomWatchListMutation,
  useAddTitleToWatchListByIdMutation,
  useRemoveTitleFromWatchListByIdMutation,
  useDeleteCustomWatchListMutation,
  useRenameCustomWatchListMutation,
  useGetTitlesInDefaultWatchListQuery,
  useGetTitlesInWatchListByIdQuery,
  useGetUserWatchListsQuery,
  useGetWatchListsWithTitleQuery,
  useClearDefaultWatchListMutation,
  useClearWatchListByIdMutation,
} = watchListApi;