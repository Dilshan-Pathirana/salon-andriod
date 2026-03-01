import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../types';
import { authApi } from '../services';
import { auth, db, tsToString } from '../services/api';

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
    return new Promise<void>((resolve) => {
      let resolved = false;
      // Keep listener alive so auth state changes (e.g. token refresh, sign-out)
      // are picked up automatically. Only resolve the promise on first emission.
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const d = userDoc.data();
              const user: User = {
                id: firebaseUser.uid,
                phoneNumber: d.phoneNumber,
                firstName: d.firstName,
                lastName: d.lastName,
                role: d.role,
                profileImageUrl: d.profileImageUrl ?? null,
                isActive: d.isActive,
                createdAt: tsToString(d.createdAt),
              };
              set({ user, isAuthenticated: true, isInitialized: true });
            } else {
              set({ user: null, isAuthenticated: false, isInitialized: true });
            }
          } catch {
            set({ isInitialized: true });
          }
        } else {
          set({ user: null, isAuthenticated: false, isInitialized: true });
        }
        if (!resolved) { resolved = true; resolve(); }
      });
    });
  },

  login: async (phoneNumber: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(phoneNumber, password);
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
      await authApi.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
