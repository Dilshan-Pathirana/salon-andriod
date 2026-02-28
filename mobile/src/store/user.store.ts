import { create } from 'zustand';
import { User } from '../types';
import { usersApi } from '../services';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (data: {
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  clear: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await usersApi.getAllUsers();
      set({ users, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load users';
      set({ error: message, isLoading: false });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersApi.createUser(data);
      await get().fetchUsers();
      set({ isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      await usersApi.deleteUser(id);
      await get().fetchUsers();
    } catch (error) {
      throw error;
    }
  },

  deactivateUser: async (id: string) => {
    try {
      await usersApi.deactivateUser(id);
      await get().fetchUsers();
    } catch (error) {
      throw error;
    }
  },

  activateUser: async (id: string) => {
    try {
      await usersApi.activateUser(id);
      await get().fetchUsers();
    } catch (error) {
      throw error;
    }
  },

  clear: () => {
    set({ users: [], error: null });
  },
}));
