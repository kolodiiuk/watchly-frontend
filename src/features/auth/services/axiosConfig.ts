import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../../app/api/baseApi.ts';
import { clearCredentials, setCredentials } from './authSlice.ts';
import type { Store } from '@reduxjs/toolkit';
import type { AuthSessionResponse } from './authSession.ts';
import { resolveRole } from './authSession.ts';
import { authStorage } from './authStorage.ts';
import type { RootState } from '../../../app/store.ts';

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

type QueueEntry = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

let store: Store | null = null;

export const injectStore = (_store: Store) => {
  store = _store;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach(entry => {
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve();
    }
  });

  failedQueue = [];
};

const shouldSkipRefresh = (config?: AxiosRequestConfig) => {
  const url = (config?.url ?? '').replace(/^\/+/, '');
  return (
    url.startsWith('auth/sign-in') ||
    url.startsWith('auth/sign-up') ||
    url.startsWith('auth/refresh') ||
    url.startsWith('auth/sign-out')
  );
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = authStorage.getAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest)
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch(queueError => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('Missing refresh token');
        }

        const response = await api.post('/auth/refresh', { refreshToken });
        const payload = response.data as AuthSessionResponse;
        const currentState = store?.getState() as RootState | undefined;
        const user = payload.user ?? currentState?.auth.user ?? null;
        const role = resolveRole({ user, role: payload.role ?? currentState?.auth.role ?? null });

        authStorage.setAccessToken(payload.token);
        authStorage.setRefreshToken(payload.refreshToken);
        authStorage.setRole(role);
        if (store) {
          store.dispatch(setCredentials({ user, role, token: payload.token, refreshToken: payload.refreshToken }));
        }
        processQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (store) {
          store.dispatch(clearCredentials());
        }
        window.location.href = '/auth/sign-in';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
