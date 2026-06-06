import { baseApi } from '../../../app/api/baseApi.ts';

export interface RelevantCommentRequest {
  topic: string;
  excludeOwnComments: boolean;
}

export interface CommentHighlightDto {
  id: number;
  highlighted: string;
}

export const assistantApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getRelevantTitleComments: builder.mutation<
      CommentHighlightDto[],
      { titleId: number; request: RelevantCommentRequest }
    >({
      query: ({ titleId, request }) => ({
        url: `assistant/relevant/${titleId}`,
        method: 'POST',
        body: request,
      }),
    }),

    getRelevantEpisodeComments: builder.mutation<
      CommentHighlightDto[],
      { episodeId: number; request: RelevantCommentRequest }
    >({
      query: ({ episodeId, request }) => ({
        url: `assistant/relevant/episode/${episodeId}`,
        method: 'POST',
        body: request,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRelevantTitleCommentsMutation,
  useGetRelevantEpisodeCommentsMutation,
} = assistantApi;
