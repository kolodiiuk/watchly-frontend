import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { clearCredentials, setCredentials } from '../../features/auth/services/authSlice.ts';
import { resolveRole } from '../../features/auth/services/authSession.ts';
import type { AuthSessionResponse } from '../../features/auth/services/authSession.ts';
import { authStorage } from '../../features/auth/services/authStorage.ts';
import type { RootState } from '../store.ts';

export const API_BASE_URL = 'http://localhost:5171';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  prepareHeaders: headers => {
    const accessToken = authStorage.getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

const shouldSkipRefresh = (args: string | FetchArgs) => {
  const url = (typeof args === 'string' ? args : args.url).replace(/^\/+/, '');
  return (
    url.startsWith('auth/sign-in') ||
    url.startsWith('auth/sign-up') ||
    url.startsWith('auth/refresh') ||
    url.startsWith('auth/sign-out')
  );
};

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401 && !shouldSkipRefresh(args)) {
    const refreshToken = authStorage.getRefreshToken();

    if (!refreshToken) {
      api.dispatch(clearCredentials());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: 'auth/refresh',
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as AuthSessionResponse;
      const currentState = api.getState() as RootState;
      const currentUser = currentState.auth.user;
      const currentRole = currentState.auth.role;
      const user = data.user ?? currentUser ?? null;
      const role = resolveRole({ user, role: data.role ?? currentRole });

      authStorage.setAccessToken(data.token);
      authStorage.setRefreshToken(data.refreshToken);
      authStorage.setRole(role);
      if (user) {
        authStorage.setUser(user);
      }
      api.dispatch(
        setCredentials({
          user,
          role,
          token: data.token,
          refreshToken: data.refreshToken,
        })
      );
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['AdminContent', 'WatchTracking', 'UserStats'],
  endpoints: () => ({}),
});
