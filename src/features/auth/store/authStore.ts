import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../../../shared/types/api.types';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  sessionRevision: number;
  login: (user: AuthResponse) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      sessionRevision: 0,

      login: (user: AuthResponse) => {
        localStorage.setItem('accessToken', user.accessToken);
        localStorage.setItem('refreshToken', user.refreshToken);
        set((state) => ({ user, isAuthenticated: true, sessionRevision: state.sessionRevision + 1 }));
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set((state) => ({ user: null, isAuthenticated: false, sessionRevision: state.sessionRevision + 1 }));
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set((state) => ({
          user: state.user ? { ...state.user, accessToken, refreshToken } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
