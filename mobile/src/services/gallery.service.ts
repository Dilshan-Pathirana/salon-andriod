import api from './api';
import { ApiResponse, GalleryItem } from '../types';

export const galleryApi = {
  getAll: async (includeInactive = false): Promise<GalleryItem[]> => {
    const response = await api.get<ApiResponse<GalleryItem[]>>('/gallery', {
      params: includeInactive ? { includeInactive: 'true' } : {},
    });
    return response.data.data;
  },

  getByCategory: async (category: string): Promise<GalleryItem[]> => {
    const response = await api.get<ApiResponse<GalleryItem[]>>(`/gallery/category/${category}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<GalleryItem> => {
    const response = await api.get<ApiResponse<GalleryItem>>(`/gallery/${id}`);
    return response.data.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    imageUrl: string;
    category?: string;
    sortOrder?: number;
  }): Promise<GalleryItem> => {
    const response = await api.post<ApiResponse<GalleryItem>>('/gallery', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<{
    title: string;
    description: string | null;
    imageUrl: string;
    category: string;
    isActive: boolean;
    sortOrder: number;
  }>): Promise<GalleryItem> => {
    const response = await api.put<ApiResponse<GalleryItem>>(`/gallery/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gallery/${id}`);
  },
};
