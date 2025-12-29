import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../../../shared/types/api.types';

interface AuthState {
    user: AuthResponse | null;
    isAuthenticated: boolean;
    login: (user: AuthResponse) => void;
    logout: () => void;
    updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            login: (user: AuthResponse) => {
                localStorage.setItem('accessToken', user.accessToken);
                localStorage.setItem('refreshToken', user.refreshToken);
                set({ user, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, isAuthenticated: false });
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
