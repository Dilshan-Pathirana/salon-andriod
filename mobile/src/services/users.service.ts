import {
  collection, query, where, orderBy, getDocs, getDoc, doc,
} from 'firebase/firestore';
import { db, auth, callFunction, tsToString } from './api';
import { User } from '../types';

function mapUser(id: string, d: Record<string, any>): User {
  return {
    id,
    phoneNumber: d.phoneNumber,
    firstName: d.firstName,
    lastName: d.lastName,
    role: d.role,
    profileImageUrl: d.profileImageUrl ?? null,
    isActive: d.isActive,
    createdAt: tsToString(d.createdAt),
  };
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) throw new Error('User profile not found');
    return mapUser(uid, snap.data());
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    password?: string;
    profileImageUrl?: string | null;
  }): Promise<User> => {
    return callFunction<User>('updateProfile', data);
  },

  getAllUsers: async (): Promise<User[]> => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapUser(d.id, d.data()));
  },

  createUser: async (data: {
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<User> => {
    return callFunction<User>('adminManageUser', { action: 'create', ...data });
  },

  deleteUser: async (id: string): Promise<void> => {
    await callFunction('adminManageUser', { action: 'delete', userId: id });
  },

  deactivateUser: async (id: string): Promise<User> => {
    return callFunction<User>('adminManageUser', { action: 'deactivate', userId: id });
  },

  activateUser: async (id: string): Promise<User> => {
    return callFunction<User>('adminManageUser', { action: 'activate', userId: id });
  },

  // Aliases used by admin/shared screens
  getUsers: async (): Promise<User[]> => {
    return usersApi.getAllUsers();
  },
};
