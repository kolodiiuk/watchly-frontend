import { baseApi } from '../../../app/api/baseApi.ts';

export interface VoteTitleRequest {
  titleId: number;
  value: number;
}

export interface ChangeVoteTitleRequest {
  voteId: number;
  titleId: number;
  value: number;
}

export interface VoteEpisodeRequest {
  episodeId: number;
  value: number;
}

export interface ChangeVoteEpisodeRequest {
  voteId: number;
  episodeId: number;
  value: number;
}

export interface UserVote {
  id: number;
  value: number;
}

export const voteApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    voteTitle: builder.mutation<void, VoteTitleRequest>({
      query: ({ titleId, value }) => ({
        url: `vote/title/${titleId}/${value}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, {titleId}) => [{type: 'Vote', id: `title-${titleId}`}, {type: 'Catalog', id: `title-${titleId}`}],
    }),

    changeVoteTitle: builder.mutation<void, ChangeVoteTitleRequest>({
      query: ({ voteId, value }) => ({
        url: `vote/title/${voteId}/${value}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, {titleId}) => [{type: 'Vote', id: `title-${titleId}`}, {type: 'Catalog', id: `title-${titleId}`}],
    }),

    getTitleVote: builder.query<UserVote | null, number>({
      query: titleId => ({url: `vote/title/${titleId}`, method: 'GET'}),
      providesTags: (_result, _error, titleId) => [{type: 'Vote', id: `title-${titleId}`}],
    }),

    voteEpisode: builder.mutation<void, VoteEpisodeRequest>({
      query: ({ episodeId, value }) => ({
        url: `vote/episode/${episodeId}/${value}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, {episodeId}) => [{type: 'Vote', id: `episode-${episodeId}`}, {type: 'Catalog', id: `episode-${episodeId}`}],
    }),

    changeVoteEpisode: builder.mutation<void, ChangeVoteEpisodeRequest>({
      query: ({ voteId, value }) => ({
        url: `vote/episode/${voteId}/${value}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, {episodeId}) => [{type: 'Vote', id: `episode-${episodeId}`}, {type: 'Catalog', id: `episode-${episodeId}`}],
    }),

    getEpisodeVote: builder.query<UserVote | null, number>({
      query: episodeId => ({url: `vote/episode/${episodeId}`, method: 'GET'}),
      providesTags: (_result, _error, episodeId) => [{type: 'Vote', id: `episode-${episodeId}`}],
    }),
  }),
  overrideExisting: false,
});

export const {
  useVoteTitleMutation,
  useChangeVoteTitleMutation,
  useGetTitleVoteQuery,
  useVoteEpisodeMutation,
  useChangeVoteEpisodeMutation,
  useGetEpisodeVoteQuery,
} = voteApi;
