import { baseApi } from './baseApi.ts';
import type { User } from '../models/User.ts';

export interface LeaveCommentRequest {
  contentId: number;
  text: string;
  isTitle: boolean;
}

export interface UpdateCommentRequest {
  commentId: number;
  text: string;
}

export interface CommentDto {
  id: number;
  contentId: number;
  isTitle: boolean;
  userId: string;
  updatedAt: string;
  text: string;
  userDto: User;
}

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
