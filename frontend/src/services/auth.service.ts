import apiClient from '@/lib/axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth.types';

export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: () =>
    apiClient.post<AuthResponse>('/auth/refresh').then((r) => r.data),

  logout: () =>
    apiClient.post<void>('/auth/logout').then((r) => r.data),
};
