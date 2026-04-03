import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../../app/api/baseApi.ts';
import { clearStoredUser } from './authStorage.ts';
import { storage } from './StorageService.ts';

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

type QueueEntry = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(entry => {
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (token) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            return api(originalRequest);
          })
          .catch(queueError => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('Missing refresh token');
        }

        const response = await api.post('/auth/refresh', { refreshToken });
        const { token, refreshToken: newRefreshToken } = response.data as {
          token: string;
          refreshToken?: string;
        };

        storage.setTokens(token, newRefreshToken || refreshToken);
        processQueue(null, token);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearTokens();
        clearStoredUser();
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
