import { baseApi } from './baseApi.ts';

export interface VoteTitleRequest {
  titleId: number;
  value: number;
}

export interface ChangeVoteTitleRequest {
  voteId: number;
  value: number;
}

export interface VoteEpisodeRequest {
  episodeId: number;
  value: number;
}

export interface ChangeVoteEpisodeRequest {
  voteId: number;
  value: number;
}

export const voteApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    voteTitle: builder.mutation<void, VoteTitleRequest>({
      query: ({ titleId, value }) => ({
        url: `vote/title/${titleId}/${value}`,
        method: 'POST',
      }),
    }),

    changeVoteTitle: builder.mutation<void, ChangeVoteTitleRequest>({
      query: ({ voteId, value }) => ({
        url: `vote/title/${voteId}/${value}`,
        method: 'PATCH',
      }),
    }),

    voteEpisode: builder.mutation<void, VoteEpisodeRequest>({
      query: ({ episodeId, value }) => ({
        url: `vote/episode/${episodeId}/${value}`,
        method: 'POST',
      }),
    }),

    changeVoteEpisode: builder.mutation<void, ChangeVoteEpisodeRequest>({
      query: ({ voteId, value }) => ({
        url: `vote/episode/${voteId}/${value}`,
        method: 'PATCH',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useVoteTitleMutation,
  useChangeVoteTitleMutation,
  useVoteEpisodeMutation,
  useChangeVoteEpisodeMutation,
} = voteApi;
