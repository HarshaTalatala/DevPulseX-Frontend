import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDto } from '@/types';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  sessionExpiresAt: number | null;
  hasHydrated: boolean;
  setAuth: (user: UserDto, token: string) => void;
  refreshSession: () => void;
  setHasHydrated: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      hasHydrated: false,
      setAuth: (user, token) => {
        const sessionExpiresAt = Date.now() + SESSION_TTL_MS;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, sessionExpiresAt });
      },
      refreshSession: () => {
        set((state) => {
          if (!state.isAuthenticated) return state;
          return { ...state, sessionExpiresAt: Date.now() + SESSION_TTL_MS };
        });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('trello_access_token');
        set({ user: null, token: null, isAuthenticated: false, sessionExpiresAt: null });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        const now = Date.now();
        const isExpired = !state?.sessionExpiresAt || state.sessionExpiresAt <= now;

        if (isExpired) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          state?.clearAuth();
        } else if (state?.token) {
          // Keep axios interceptor source-of-truth in sync after hydration.
          localStorage.setItem('token', state.token);
          if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
          }
        }

        state?.setHasHydrated(true);
      },
    }
  )
);
