import api from './api';
import { ApiResponse, Service } from '../types';

export const servicesApi = {
  getAll: async (includeInactive = false): Promise<Service[]> => {
    const response = await api.get<ApiResponse<Service[]>>('/services', {
      params: includeInactive ? { includeInactive: 'true' } : {},
    });
    return response.data.data;
  },

  getByCategory: async (category: string): Promise<Service[]> => {
    const response = await api.get<ApiResponse<Service[]>>(`/services/category/${category}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    category: string;
    sortOrder?: number;
  }): Promise<Service> => {
    const response = await api.post<ApiResponse<Service>>('/services', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    description: string | null;
    duration: number;
    price: number;
    category: string;
    isActive: boolean;
    sortOrder: number;
  }>): Promise<Service> => {
    const response = await api.put<ApiResponse<Service>>(`/services/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};
