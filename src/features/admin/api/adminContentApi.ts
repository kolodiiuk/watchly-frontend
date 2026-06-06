import { baseApi } from '../../../app/api/baseApi.ts';
import type { CreateEpisodeRequest, CreateSeasonRequest, CreateTitleRequest, TitleReferenceOptions, UpdateEpisodeRequest, UpdateSeasonRequest, UpdateTitleRequest } from '../models/types.ts';

const adminContentTag = { type: 'AdminContent' as const, id: 'LIST' };

export const adminContentApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTitleReferenceOptions: builder.query<TitleReferenceOptions, { productionCompanyTerm: string; selectedProductionCompanyIds: number[] }>({
      query: ({ productionCompanyTerm, selectedProductionCompanyIds }) => {
        const query = new URLSearchParams();
        if (productionCompanyTerm) {
          query.set('productionCompanyTerm', productionCompanyTerm);
        }
        selectedProductionCompanyIds.forEach(id => query.append('selectedProductionCompanyIds', String(id)));

        return { url: `admincontent/title-reference-options?${query.toString()}`, method: 'GET' };
      },
    }),

    addTitle: builder.mutation<number, CreateTitleRequest>({
      query: body => ({
        url: 'admincontent/titles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [adminContentTag],
    }),

    updateTitle: builder.mutation<void, { titleId: number; body: UpdateTitleRequest }>({
      query: ({ titleId, body }) => ({
        url: `admincontent/titles/${titleId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [adminContentTag],
    }),

    uploadPoster: builder.mutation<void, { titleId: number; poster: File }>({
      query: ({ titleId, poster }) => {
        const formData = new FormData();
        formData.append('poster', poster);

        return {
          url: `admincontent/titles/${titleId}/poster`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [adminContentTag],
    }),

    softDeleteTitle: builder.mutation<void, number>({
      query: titleId => ({
        url: `admincontent/titles/${titleId}/delete`,
        method: 'PATCH',
      }),
      invalidatesTags: [adminContentTag],
    }),

    addSeason: builder.mutation<number, { titleId: number; body: CreateSeasonRequest }>({
      query: ({ titleId, body }) => ({
        url: `admincontent/titles/${titleId}/seasons`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [adminContentTag],
    }),

    updateSeason: builder.mutation<void, { seasonId: number; body: UpdateSeasonRequest }>({
      query: ({ seasonId, body }) => ({
        url: `admincontent/seasons/${seasonId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [adminContentTag],
    }),

    removeSeason: builder.mutation<void, number>({
      query: seasonId => ({
        url: `admincontent/seasons/${seasonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [adminContentTag],
    }),

    addEpisode: builder.mutation<number, { seasonId: number; body: CreateEpisodeRequest }>({
      query: ({ seasonId, body }) => ({
        url: `admincontent/seasons/${seasonId}/episodes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [adminContentTag],
    }),

    updateEpisode: builder.mutation<void, { episodeId: number; body: UpdateEpisodeRequest }>({
      query: ({ episodeId, body }) => ({
        url: `admincontent/episodes/${episodeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [adminContentTag],
    }),

    removeEpisode: builder.mutation<void, number>({
      query: episodeId => ({
        url: `admincontent/episodes/${episodeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [adminContentTag],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTitleReferenceOptionsQuery,
  useAddTitleMutation,
  useUpdateTitleMutation,
  useUploadPosterMutation,
  useSoftDeleteTitleMutation,
  useAddSeasonMutation,
  useUpdateSeasonMutation,
  useRemoveSeasonMutation,
  useAddEpisodeMutation,
  useUpdateEpisodeMutation,
  useRemoveEpisodeMutation,
} = adminContentApi;
