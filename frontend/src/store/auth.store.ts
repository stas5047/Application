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
    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  hydrate: async () => {
    set({ isHydrated: false });

    try {
      const data = await authService.refresh();
      set({
        accessToken: data.accessToken,
        user: data.user,
        isAuthenticated: true,
      });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }

    set({ isHydrated: true });
  },
}));
