import { baseApi } from '../../../app/api/baseApi.ts';
import type { User } from '../../auth/models/User.ts';

export interface ChangeUserNameRequest {
  name: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgetPasswordRequest {
  email: string;
}

export type ProfilePictureFile = File;

export const usersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    verifyToken: builder.mutation<User, void>({
      query: () => ({ url: `users/verify`, method: 'POST' }),
    }),
    changeUsername: builder.mutation<void, ChangeUserNameRequest>({
      query: req => ({ url: `users/change-username`, method: 'POST', body: req }),
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: req => ({ url: `users/change-password`, method: 'PATCH', body: req }),
    }),
    forgetPassword: builder.mutation<void, ForgetPasswordRequest>({
      query: req => ({ url: `users/forget-password`, method: 'POST', body: req }),
    }),
    resetPassword: builder.mutation<void, { token: string }>({
      query: ({ token }) => ({ url: `users/reset-password?token=${encodeURIComponent(token)}`, method: 'POST' }),
    }),
    updateProfilePicture: builder.mutation<void, ProfilePictureFile>({
      query: file => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: `users/profile-picture`,
          method: 'PATCH',
          body: form,
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useVerifyTokenMutation,
  useChangeUsernameMutation,
  useChangePasswordMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfilePictureMutation,
} = usersApi;
