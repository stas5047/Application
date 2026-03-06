import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import type { AuthResponse, UserPayload } from '@/types/auth.types';

interface AuthState {
  user: UserPayload | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,

  login: (data: AuthResponse) => {
    localStorage.setItem('refresh_token', data.refreshToken);
    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      void authService.logout(refreshToken).catch(() => {
        // best-effort logout
      });
    }
    localStorage.removeItem('refresh_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  hydrate: async () => {
    set({ isHydrated: false });
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      try {
        const data = await authService.refresh({ refreshToken });
        set({
          accessToken: data.accessToken,
          user: data.user,
          isAuthenticated: true,
        });
        localStorage.setItem('refresh_token', data.refreshToken);
      } catch {
        localStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      }
    }

    set({ isHydrated: true });
  },
}));
