import api from './api';
import { ApiResponse, Appointment } from '../types';

export const appointmentsApi = {
  create: async (date: string, timeSlot: string): Promise<Appointment> => {
    const response = await api.post<ApiResponse<Appointment>>('/appointments', {
      date,
      timeSlot,
    });
    return response.data.data;
  },

  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments/my');
    return response.data.data;
  },

  getAll: async (filters?: {
    date?: string;
    status?: string;
    userId?: string;
  }): Promise<Appointment[]> => {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments', {
      params: filters,
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data;
  },

  cancel: async (id: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/cancel`);
    return response.data.data;
  },

  complete: async (id: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/complete`);
    return response.data.data;
  },

  markInService: async (id: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/in-service`);
    return response.data.data;
  },

  markNoShow: async (id: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/no-show`);
    return response.data.data;
  },

  update: async (id: string, data: {
    timeSlot?: string;
    date?: string;
    status?: string;
  }): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },

  // Aliases used by admin screens
  completeAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/complete`);
    return response.data.data;
  },

  cancelAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/cancel`);
    return response.data.data;
  },

  getAppointments: async (filters?: Record<string, string>): Promise<Appointment[]> => {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments', { params: filters });
    return response.data.data;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },
};
