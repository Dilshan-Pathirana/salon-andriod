import api from './api';
import { ApiResponse, Review, ReviewStats } from '../types';

export const reviewsApi = {
  getAll: async (showAll = false): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>('/reviews', {
      params: showAll ? { all: 'true' } : {},
    });
    return response.data.data;
  },

  getStats: async (): Promise<ReviewStats> => {
    const response = await api.get<ApiResponse<ReviewStats>>('/reviews/stats');
    return response.data.data;
  },

  create: async (data: {
    appointmentId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  toggleVisibility: async (id: string): Promise<Review> => {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}/toggle-visibility`);
    return response.data.data;
  },
};
