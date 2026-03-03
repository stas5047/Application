import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import apiClient from './axios';
import type { AuthResponse } from '@/types/auth.types';

// Minimal slice of auth state needed by interceptors (avoids importing the store directly)
interface AuthAccessor {
  accessToken: string | null;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _isRetrying?: boolean;
}

// Receives useAuthStore.getState so interceptors always read the current state (ADR-F001)
export function setupAxiosInterceptors(getAuthState: () => AuthAccessor): void {
  // Request interceptor: attach access token
  apiClient.interceptors.request.use((config) => {
    const { accessToken } = getAuthState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Response interceptor: handle 401 retry + global error toasts
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableRequestConfig | undefined;
      const status = error.response?.status;

      if (status === 401 && config && !config._isRetrying) {

        const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

        if (isAuthEndpoint) {
            toast.error('Invalid email or password');
            return Promise.reject(error);
        }
        config._isRetrying = true;

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          getAuthState().logout();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post<AuthResponse>(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refreshToken },
          );

          getAuthState().setAccessToken(data.accessToken);
          localStorage.setItem('refresh_token', data.refreshToken);

          if (config.headers) {
            config.headers.Authorization = `Bearer ${data.accessToken}`;
          }

          return apiClient(config);
        } catch {
          getAuthState().logout();
          return Promise.reject(error);
        }
      }

      if (status && status >= 400) {
        const responseData = error.response?.data as Record<string, unknown> | undefined;
        const message =
          typeof responseData?.message === 'string'
            ? responseData.message
            : Array.isArray(responseData?.message)
              ? (responseData.message as string[]).join(', ')
              : 'An unexpected error occurred';
        toast.error(message);
      }

      return Promise.reject(error);
    },
  );
}
