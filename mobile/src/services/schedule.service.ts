import api from './api';
import { ApiResponse, Schedule, ScheduleSummary, AvailableDay } from '../types';

export const scheduleApi = {
  getByDate: async (date: string): Promise<Schedule | null> => {
    const response = await api.get<ApiResponse<Schedule | null>>(`/schedule/${date}`);
    return response.data.data;
  },

  getRange: async (startDate?: string, endDate?: string): Promise<ScheduleSummary[]> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<ScheduleSummary[]>>('/schedule', { params });
    return response.data.data;
  },

  getAvailableDays: async (startDate: string, endDate: string): Promise<AvailableDay[]> => {
    const response = await api.get<ApiResponse<AvailableDay[]>>('/schedule/available', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  upsert: async (data: {
    date: string;
    status: string;
    startTime: string;
    endTime: string;
    slotDurationMins: number;
  }, forceSlotChange = false): Promise<Schedule> => {
    const response = await api.put<ApiResponse<Schedule>>(
      `/schedule?forceSlotChange=${forceSlotChange}`,
      data
    );
    return response.data.data;
  },

  // Aliases used by admin screens
  getScheduleByDate: async (date: string): Promise<Schedule | null> => {
    const response = await api.get<ApiResponse<Schedule | null>>(`/schedule/${date}`);
    return response.data.data;
  },

  getScheduleRange: async (startDate: string, endDate: string): Promise<ScheduleSummary[]> => {
    const response = await api.get<ApiResponse<ScheduleSummary[]>>('/schedule', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  upsertSchedule: async (data: Record<string, unknown>, forceSlotChange = false): Promise<Schedule> => {
    const response = await api.put<ApiResponse<Schedule>>(
      `/schedule?forceSlotChange=${forceSlotChange}`,
      data
    );
    return response.data.data;
  },
};
