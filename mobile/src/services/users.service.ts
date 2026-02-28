import api from './api';
import { ApiResponse, User } from '../types';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    password?: string;
    profileImageUrl?: string | null;
  }): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  createUser: async (data: {
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  deactivateUser: async (id: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/deactivate`);
    return response.data.data;
  },

  activateUser: async (id: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/activate`);
    return response.data.data;
  },

  // Aliases used by admin/shared screens
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },
};
