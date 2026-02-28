import { create } from 'zustand';
import { User, Role } from '../types';
import { authApi } from '../services';
import { setTokens, clearTokens, setUserData, getUserData, getRefreshToken } from '../utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        const user = JSON.parse(userData) as User;
        set({ user, isAuthenticated: true, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (phoneNumber: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(phoneNumber, password);
      await setTokens(data.accessToken, data.refreshToken);
      await setUserData(JSON.stringify(data.user));
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      await clearTokens();
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
    setUserData(JSON.stringify(user));
  },
}));
