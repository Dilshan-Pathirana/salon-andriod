import api from './api';
import { ApiResponse, BusinessInfo } from '../types';

export const businessInfoApi = {
  getAll: async (): Promise<BusinessInfo[]> => {
    const response = await api.get<ApiResponse<BusinessInfo[]>>('/business-info');
    return response.data.data;
  },

  getByCategory: async (category: string): Promise<BusinessInfo[]> => {
    const response = await api.get<ApiResponse<BusinessInfo[]>>(`/business-info/category/${category}`);
    return response.data.data;
  },

  upsert: async (data: {
    key: string;
    value: string;
    category: string;
  }): Promise<BusinessInfo> => {
    const response = await api.put<ApiResponse<BusinessInfo>>('/business-info', data);
    return response.data.data;
  },

  bulkUpsert: async (items: {
    key: string;
    value: string;
    category: string;
  }[]): Promise<BusinessInfo[]> => {
    const response = await api.put<ApiResponse<BusinessInfo[]>>('/business-info/bulk', { items });
    return response.data.data;
  },

  remove: async (key: string): Promise<void> => {
    await api.delete(`/business-info/${key}`);
  },
};
