import api from './api';
import { ApiResponse, Session, DashboardStats } from '../types';

export const sessionApi = {
  getSession: async (date?: string): Promise<Session> => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const response = await api.get<ApiResponse<Session>>('/session', { params });
    return response.data.data;
  },

  openSession: async (date: string): Promise<Session> => {
    const response = await api.post<ApiResponse<Session>>('/session/open', { date });
    return response.data.data;
  },

  closeSession: async (date?: string): Promise<Session> => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const response = await api.put<ApiResponse<Session>>('/session/close', null, { params });
    return response.data.data;
  },

  getDashboardStats: async (date?: string): Promise<DashboardStats> => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const response = await api.get<ApiResponse<DashboardStats>>('/session/dashboard', { params });
    return response.data.data;
  },
};
