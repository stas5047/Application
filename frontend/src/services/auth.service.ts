import apiClient from '@/lib/axios';
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from '@/types/auth.types';

export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (data: RefreshTokenRequest) =>
    apiClient.post<AuthResponse>('/auth/refresh', data).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post<void>('/auth/logout', { refreshToken }).then((r) => r.data),
};
