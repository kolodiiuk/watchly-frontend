import { baseApi } from '../../../app/api/baseApi.ts';
import type { AuthSessionResponse } from '../services/authSession.ts';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    signIn: builder.mutation<AuthSessionResponse, SignInRequest>({
      query: credentials => ({
        url: 'auth/sign-in',
        method: 'POST',
        body: credentials,
      }),
    }),
    signUp: builder.mutation<void, SignUpRequest>({
      query: userData => ({
        url: 'auth/sign-up',
        method: 'POST',
        body: userData,
      }),
    }),
    signOut: builder.mutation<void, { refreshToken: string }>({
      query: signOutDto => ({
        url: 'auth/sign-out',
        method: 'POST',
        body: signOutDto,
      }),
    }),
    refreshToken: builder.mutation<AuthSessionResponse, void>({
      query: () => ({
        url: 'auth/refresh',
        method: 'POST',
      }),
    }),
  }),
});

export const { useSignInMutation, useSignUpMutation, useSignOutMutation, useRefreshTokenMutation } = authApi;
