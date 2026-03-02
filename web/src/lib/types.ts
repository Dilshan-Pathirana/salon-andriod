export type PageType = 'home' | 'book' | 'queue' | 'profile' | 'admin';

export type UserRole = 'ADMIN' | 'CLIENT';

export interface AuthUser {
  uid: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMins: number;
  isActive: boolean;
}

export interface Story {
  id: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption: string;
  serviceId?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  date: string;
  timeSlot: string;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  queuePosition: number;
}
