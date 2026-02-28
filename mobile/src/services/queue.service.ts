import api from './api';
import { ApiResponse, LiveQueue } from '../types';

export const queueApi = {
  getLiveQueue: async (date?: string): Promise<LiveQueue> => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const response = await api.get<ApiResponse<LiveQueue>>('/queue', { params });
    return response.data.data;
  },

  reorder: async (date: string, orderedIds: string[]): Promise<void> => {
    await api.put('/queue/reorder', { date, orderedIds });
  },
};
