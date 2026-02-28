import { create } from 'zustand';
import { Appointment, Schedule, AvailableDay } from '../types';
import { appointmentsApi, scheduleApi } from '../services';

interface BookingState {
  availableDays: AvailableDay[];
  selectedDate: string | null;
  schedule: Schedule | null;
  myAppointments: Appointment[];
  isLoading: boolean;
  error: string | null;

  fetchAvailableDays: (startDate: string, endDate: string) => Promise<void>;
  fetchSchedule: (date: string) => Promise<void>;
  fetchMyAppointments: () => Promise<void>;
  bookAppointment: (date: string, timeSlot: string) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  clear: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  availableDays: [],
  selectedDate: null,
  schedule: null,
  myAppointments: [],
  isLoading: false,
  error: null,

  fetchAvailableDays: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const days = await scheduleApi.getAvailableDays(startDate, endDate);
      set({ availableDays: days, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load available days';
      set({ error: message, isLoading: false });
    }
  },

  fetchSchedule: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const schedule = await scheduleApi.getByDate(date);
      set({ schedule, selectedDate: date, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load schedule';
      set({ error: message, isLoading: false });
    }
  },

  fetchMyAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const appointments = await appointmentsApi.getMyAppointments();
      set({ myAppointments: appointments, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load appointments';
      set({ error: message, isLoading: false });
    }
  },

  bookAppointment: async (date: string, timeSlot: string) => {
    set({ isLoading: true, error: null });
    try {
      const appointment = await appointmentsApi.create(date, timeSlot);
      // Refresh schedule and appointments
      await get().fetchSchedule(date);
      await get().fetchMyAppointments();
      set({ isLoading: false });
      return appointment;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  cancelAppointment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await appointmentsApi.cancel(id);
      await get().fetchMyAppointments();
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setSelectedDate: (date: string | null) => {
    set({ selectedDate: date });
  },

  clear: () => {
    set({
      availableDays: [],
      selectedDate: null,
      schedule: null,
      myAppointments: [],
      error: null,
    });
  },
}));
