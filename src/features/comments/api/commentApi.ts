import { baseApi } from '../../../app/api/baseApi.ts';
import type {CommentDto, LeaveCommentRequest, UpdateCommentRequest} from "../models/types.ts";

export const commentApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCommentsByTitle: builder.query<CommentDto[], number>({
      query: titleId => ({ url: `comment/title/${titleId}`, method: 'GET' }),
    }),

    getCommentsByEpisode: builder.query<CommentDto[], number>({
      query: episodeId => ({ url: `comment/episode/${episodeId}`, method: 'GET' }),
    }),

    leaveComment: builder.mutation<void, LeaveCommentRequest>({
      query: req => ({ url: `comment`, method: 'POST', body: req }),
    }),

    updateComment: builder.mutation<void, UpdateCommentRequest>({
      query: req => ({ url: `comment`, method: 'PUT', body: req }),
    }),

    deleteComment: builder.mutation<void, number>({
      query: commentId => ({ url: `comment/${commentId}`, method: 'PATCH' }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsByTitleQuery,
  useGetCommentsByEpisodeQuery,
  useLeaveCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
