export type Role = 'ADMIN' | 'CLIENT';

export type AppointmentStatus = 'BOOKED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type DayStatus = 'OPEN' | 'CLOSED' | 'HOLIDAY';

export interface User {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: Role;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Schedule {
  id: string;
  date: string;
  status: DayStatus;
  startTime: string;
  endTime: string;
  slotDurationMins: number;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  slots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ScheduleSummary {
  id: string;
  date: string;
  status: DayStatus;
  startTime: string;
  endTime: string;
  slotDurationMins: number;
  appointmentCount: number;
}

export interface AvailableDay {
  date: string;
  status: DayStatus;
  startTime: string;
  endTime: string;
  slotDurationMins: number;
  totalSlots: number;
  availableSlots: number;
}

export interface Appointment {
  id: string;
  date: string;
  timeSlot: string;
  queuePosition: number;
  status: AppointmentStatus;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  slotDurationMins?: number;
  createdAt: string;
}

export interface QueueItem {
  id: string;
  position: number;
  name: string;
  userId: string;
  phoneNumber: string;
  timeSlot: string;
  status: AppointmentStatus;
  slotDurationMins: number;
  estimatedWaitMins: number;
}

export interface LiveQueue {
  date: string;
  currentlyServing: {
    id: string;
    name: string;
    timeSlot: string;
    phoneNumber: string;
  } | null;
  queue: QueueItem[];
  totalInQueue: number;
}

export interface Session {
  id?: string;
  date: string;
  isClosed: boolean;
  exists: boolean;
  openedAt: string | null;
  closedAt: string | null;
}

export interface DashboardStats {
  date: string;
  sessionStatus: 'OPEN' | 'CLOSED' | 'NO_SCHEDULE';
  totalAppointments: number;
  inQueue: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
