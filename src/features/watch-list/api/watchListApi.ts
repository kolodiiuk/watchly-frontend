import { baseApi } from '../../../app/api/baseApi.ts';
import type { TitleShortInfo } from '../../titles-details/models/TitleInfo.ts';
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
      invalidatesTags: (_result, _error, titleId) => [
        {type: 'WatchList', id: 'LISTS'},
        {type: 'WatchList', id: `TITLE-${titleId}`},
      ],
    }),

    removeTitleFromDefaultWatchList: builder.mutation<void, number>({
      query: titleId => ({
        url: `watchList/${titleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, titleId) => [
        {type: 'WatchList', id: 'LISTS'},
        {type: 'WatchList', id: `TITLE-${titleId}`},
      ],
    }),

    createCustomWatchList: builder.mutation<void, string>({
      query: name => ({
        url: `watchList/new/${encodeURIComponent(name)}`,
        method: 'POST',
      }),
      invalidatesTags: [{type: 'WatchList', id: 'LISTS'}],
    }),

    addTitleToWatchListById: builder.mutation<void, WatchListTitleRequest>({
      query: ({ watchListId, titleId }) => ({
        url: `watchList/${watchListId}/title/${titleId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, {titleId}) => [
        {type: 'WatchList', id: 'LISTS'},
        {type: 'WatchList', id: `TITLE-${titleId}`},
      ],
    }),

    removeTitleFromWatchListById: builder.mutation<void, WatchListTitleRequest>({
      query: ({ watchListId, titleId }) => ({
        url: `watchList/${watchListId}/title/${titleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, {titleId}) => [
        {type: 'WatchList', id: 'LISTS'},
        {type: 'WatchList', id: `TITLE-${titleId}`},
      ],
    }),

    deleteCustomWatchList: builder.mutation<void, number>({
      query: watchListId => ({
        url: `watchList/delete/${watchListId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{type: 'WatchList', id: 'LISTS'}],
    }),

    renameCustomWatchList: builder.mutation<void, RenameWatchListRequest>({
      query: ({ watchListId, newName }) => ({
        url: `watchList/${watchListId}/${encodeURIComponent(newName)}`,
        method: 'PATCH',
      }),
      invalidatesTags: [{type: 'WatchList', id: 'LISTS'}],
    }),

    getTitlesInDefaultWatchList: builder.query<TitleShortInfo[], void>({
      query: () => ({
        url: 'watchList/titles',
        method: 'GET',
      }),
      providesTags: [{type: 'WatchList', id: 'LISTS'}],
    }),

    getTitlesInWatchListById: builder.query<TitleShortInfo[], number>({
      query: watchListId => ({
        url: `watchList/titles/${watchListId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, watchListId) => [{type: 'WatchList', id: `LIST-${watchListId}`}],
    }),

    getUserWatchLists: builder.query<WatchListInfo[], void>({
      query: () => ({
        url: 'watchList/lists',
        method: 'GET',
      }),
      providesTags: [{type: 'WatchList', id: 'LISTS'}],
    }),

    getWatchListsWithTitle: builder.query<WatchListShortInfo[], number>({
      query: titleId => ({
        url: `watchList/lists/${titleId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, titleId) => [{type: 'WatchList', id: `TITLE-${titleId}`}],
    }),

    clearDefaultWatchList: builder.mutation<void, void>({
      query: () => ({
        url: 'watchList/clear',
        method: 'DELETE',
      }),
      invalidatesTags: [{type: 'WatchList', id: 'LISTS'}],
    }),

    clearWatchListById: builder.mutation<void, number>({
      query: watchListId => ({
        url: `watchList/clear/${watchListId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, watchListId) => [
        {type: 'WatchList', id: 'LISTS'},
        {type: 'WatchList', id: `LIST-${watchListId}`},
      ],
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
