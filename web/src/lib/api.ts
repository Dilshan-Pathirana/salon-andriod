import axios from 'axios';
import { Appointment, Service, Story } from './types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firebaseAuth, firebaseDb, firebaseFunctions } from './firebase';

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const fallbackApiBaseUrl = import.meta.env.DEV ? 'http://localhost:3001/api/v1' : '/api/v1';

const api = axios.create({
  baseURL: configuredApiBaseUrl || fallbackApiBaseUrl,
  timeout: 10000,
});

type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'ADMIN' | 'CLIENT';
  profileImageUrl?: string | null;
};

type SessionState = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type LiveQueueItem = {
  id: string;
  position: number;
  name: string;
  userId: string;
  phoneNumber: string;
  timeSlot: string;
  status: 'BOOKED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  slotDurationMins: number;
  estimatedWaitMins: number;
};

export type LiveQueueResponse = {
  date: string;
  currentlyServing: {
    id: string;
    name: string;
    timeSlot: string;
    phoneNumber: string;
  } | null;
  queue: LiveQueueItem[];
  totalInQueue: number;
};

export type ManagedService = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
  isActive: boolean;
};

export type ManagedAppointment = {
  id: string;
  date: string;
  timeSlot: string;
  status: 'BOOKED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  userId: string;
  userName: string;
  phoneNumber: string;
  isReserved: boolean;
};

export type ManagedWorkItem = {
  id: string;
  topic: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
};

export type ManagedScheduleDay = {
  date: string;
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
};

export type ManagedUser = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'ADMIN' | 'CLIENT';
  isActive: boolean;
  createdAt: string;
};

export type AdminDashboardStats = {
  date: string;
  sessionStatus: 'OPEN' | 'CLOSED' | 'NO_SCHEDULE';
  totalAppointments: number;
  inQueue: number;
  completed: number;
  cancelled: number;
  noShow: number;
  registeredUsers: number;
  activeServices: number;
  appointmentsToday: number;
  userRegistrationTrend: Array<{ day: string; count: number }>;
  averageAppointmentTime: number;
};

const SESSION_STORAGE_KEY = 'salon_web_session';

function getStoredSession(): SessionState | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function setStoredSession(session: SessionState): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function toFirebaseEmail(phoneNumber: string): string {
  return `${phoneNumber}@salon.app`;
}

async function loginWithFirebaseAuth(phoneNumber: string, password: string): Promise<SessionState> {
  const credential = await signInWithEmailAndPassword(firebaseAuth, toFirebaseEmail(phoneNumber), password);
  const accessToken = await credential.user.getIdToken();
  const refreshToken = credential.user.refreshToken;

  const profileRef = doc(firebaseDb, 'users', credential.user.uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    throw new Error('User profile not found');
  }

  const profile = profileSnap.data() as Record<string, any>;

  const session: SessionState = {
    accessToken,
    refreshToken,
    user: {
      id: credential.user.uid,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || phoneNumber,
      role: profile.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
      profileImageUrl: profile.profileImageUrl || null,
    },
  };

  setStoredSession(session);
  return session;
}

export type { SessionState, SessionUser };

export function getCurrentSession(): SessionState | null {
  return getStoredSession();
}

export function isSessionAuthenticated(): boolean {
  return Boolean(getStoredSession()?.accessToken);
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function loginWithPhone(phoneNumber: string, password: string): Promise<SessionState> {
  try {
    const { data } = await api.post('/auth/login', {
      phoneNumber,
      password,
    });

    const session: SessionState = {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      user: data.data.user,
    };

    setStoredSession(session);
    return session;
  } catch {
    return loginWithFirebaseAuth(phoneNumber, password);
  }
}

export async function ensureSession(): Promise<SessionState> {
  const existing = getStoredSession();
  if (existing?.accessToken) {
    return existing;
  }

  throw new Error('Not authenticated');
}

export async function ensureAdminSession(): Promise<SessionState> {
  const existing = getStoredSession();
  if (existing?.accessToken && existing.user?.role === 'ADMIN') {
    return existing;
  }

  const adminPhone = import.meta.env.VITE_ADMIN_PHONE || '0712345678';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin12345';
  return loginWithPhone(adminPhone, adminPassword);
}

async function forceAdminLogin(): Promise<SessionState> {
  const adminPhone = import.meta.env.VITE_ADMIN_PHONE || '0712345678';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin12345';
  return loginWithPhone(adminPhone, adminPassword);
}

async function withAdminRetry<T>(request: (accessToken: string) => Promise<T>): Promise<T> {
  const session = await ensureAdminSession();
  try {
    return await request(session.accessToken);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const refreshed = await forceAdminLogin();
      return request(refreshed.accessToken);
    }
    throw error;
  }
}

export async function getMyProfile(): Promise<SessionUser> {
  const session = await ensureSession();
  const { data } = await api.get('/users/profile', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  return data.data;
}

export async function updateMyProfile(payload: {
  firstName?: string;
  lastName?: string;
  password?: string;
  profileImageUrl?: string | null;
}): Promise<SessionUser> {
  const session = await ensureSession();
  const { data } = await api.put('/users/profile', payload, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const updatedUser = data.data as SessionUser;
  setStoredSession({ ...session, user: updatedUser });
  return updatedUser;
}

export async function logoutCurrentSession(): Promise<void> {
  const session = getStoredSession();
  if (session?.refreshToken) {
    await api.post('/auth/logout', { refreshToken: session.refreshToken });
  }
  clearStoredSession();
}

export async function registerClient(payload: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}): Promise<SessionState> {
  try {
    const { data } = await api.post('/auth/register', {
      ...payload,
      role: 'CLIENT',
    });

    const session: SessionState = {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      user: data.data.user,
    };

    setStoredSession(session);
    return session;
  } catch {
    const registerUser = httpsCallable(firebaseFunctions, 'registerUser');
    await registerUser({
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });

    return loginWithFirebaseAuth(payload.phoneNumber, payload.password);
  }
}

export async function getScheduleByDate(date: string): Promise<{
  date: string;
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
} | null> {
  const session = await ensureAdminSession();
  const { data } = await api.get(`/schedule/${date}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  return data.data || null;
}

export async function getClientScheduleByDate(date: string): Promise<{
  date: string;
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
  slots: Array<{ time: string; available: boolean }>;
} | null> {
  const session = await ensureSession();
  const { data } = await api.get(`/schedule/${date}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  return data.data || null;
}

export async function upsertDaySchedule(payload: {
  date: string;
  status: 'OPEN' | 'CLOSED';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
}): Promise<void> {
  const session = await ensureAdminSession();
  await api.put('/schedule', payload, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
}

export async function openDaySession(date: string): Promise<void> {
  const session = await ensureAdminSession();
  await api.post(
    '/session/open',
    { date },
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );
}

export async function getServices(): Promise<Service[]> {
  const { data } = await api.get('/services');
  return data.data || data.services || [];
}

export async function getStories(): Promise<Story[]> {
  const { data } = await api.get('/gallery');
  return data.data || data.items || [];
}

export async function getLiveQueue(date?: string): Promise<LiveQueueResponse> {
  const { data } = await api.get('/queue', {
    params: date ? { date } : undefined,
  });
  return data.data || { date: '', currentlyServing: null, queue: [], totalInQueue: 0 };
}

export async function getMyAppointments(token?: string): Promise<Appointment[]> {
  const resolvedToken = token || (await ensureSession()).accessToken;
  const { data } = await api.get('/appointments/my', {
    headers: { Authorization: `Bearer ${resolvedToken}` },
  });
  return data.data || data.appointments || [];
}

export async function createAppointment(payload: { date: string; timeSlot: string }): Promise<Appointment> {
  const session = await ensureSession();
  const { data } = await api.post('/appointments', payload, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  return data.data || data;
}

export async function cancelMyAppointment(id: string): Promise<void> {
  const session = await ensureSession();
  await api.put(
    `/appointments/${id}/cancel`,
    {},
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );
}

export async function adminGetServices(): Promise<ManagedService[]> {
  const session = await ensureAdminSession();
  const { data } = await api.get('/services', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const rows = data.data || [];
  return rows.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    duration: item.duration,
    price: Number(item.price),
    category: item.category,
    isActive: item.isActive,
  }));
}

export async function adminCreateService(payload: {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
}): Promise<ManagedService> {
  const session = await ensureAdminSession();
  const { data } = await api.post('/services', payload, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const item = data.data;
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    duration: item.duration,
    price: Number(item.price),
    category: item.category,
    isActive: item.isActive,
  };
}

export async function adminUpdateService(
  id: string,
  payload: Partial<{
    name: string;
    description?: string;
    duration: number;
    price: number;
    category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
    isActive: boolean;
  }>
): Promise<ManagedService> {
  const session = await ensureAdminSession();
  const { data } = await api.put(`/services/${id}`, payload, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const item = data.data;
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    duration: item.duration,
    price: Number(item.price),
    category: item.category,
    isActive: item.isActive,
  };
}

export async function adminDeleteService(id: string): Promise<void> {
  const session = await ensureAdminSession();
  await api.delete(`/services/${id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
}

export async function adminGetScheduleRange(startDate: string, endDate: string): Promise<ManagedScheduleDay[]> {
  const session = await ensureAdminSession();
  const { data } = await api.get('/schedule', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    params: { startDate, endDate },
  });
  return data.data || [];
}

export async function adminGetAppointments(filters?: {
  date?: string;
  status?: 'BOOKED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}): Promise<ManagedAppointment[]> {
  const session = await ensureAdminSession();
  const { data } = await api.get('/appointments', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    params: filters,
  });
  const rows = data.data || [];

  return rows.map((item: any) => ({
    id: item.id,
    date: item.date,
    timeSlot: item.timeSlot,
    status: item.status,
    userId: item.user?.id || '',
    userName: `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim(),
    phoneNumber: item.user?.phoneNumber || '',
    isReserved: item.user?.id === session.user.id,
  }));
}

export async function adminCreateReservedAppointment(payload: {
  date: string;
  timeSlot: string;
}): Promise<ManagedAppointment> {
  const session = await ensureAdminSession();
  const { data } = await api.post('/appointments', payload, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const item = data.data;
  return {
    id: item.id,
    date: item.date,
    timeSlot: item.timeSlot,
    status: item.status,
    userId: item.user?.id || session.user.id,
    userName: 'RESERVED',
    phoneNumber: item.user?.phoneNumber || session.user.phoneNumber,
    isReserved: true,
  };
}

export async function adminDeleteAppointment(id: string): Promise<void> {
  const session = await ensureAdminSession();
  await api.delete(`/appointments/${id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
}

export async function adminCompleteAppointment(id: string): Promise<void> {
  const session = await ensureAdminSession();
  await api.put(
    `/appointments/${id}/complete`,
    {},
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );
}

export async function adminReorderQueue(date: string, orderedIds: string[]): Promise<void> {
  const session = await ensureAdminSession();
  await api.put(
    '/queue/reorder',
    { date, orderedIds },
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );
}

export async function adminCloseSession(date: string): Promise<void> {
  const session = await ensureAdminSession();
  await api.put('/session/close', null, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    params: { date },
  });
}

function decodeWorkDescription(raw?: string) {
  if (!raw) {
    return {
      description: '',
      beforeImageUrl: '',
      afterImageUrl: '',
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed) {
      return {
        description: parsed.description || '',
        beforeImageUrl: parsed.beforeImageUrl || '',
        afterImageUrl: parsed.afterImageUrl || '',
      };
    }
  } catch {
  }

  return {
    description: raw,
    beforeImageUrl: '',
    afterImageUrl: '',
  };
}

function encodeWorkDescription(payload: {
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
}): string {
  return JSON.stringify(payload);
}

export async function adminGetWorkItems(): Promise<ManagedWorkItem[]> {
  const session = await ensureAdminSession();
  const { data } = await api.get('/gallery', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const rows = data.data || [];
  return rows.map((item: any) => {
    const meta = decodeWorkDescription(item.description);
    return {
      id: item.id,
      topic: item.title,
      description: meta.description,
      beforeImageUrl: meta.beforeImageUrl,
      afterImageUrl: meta.afterImageUrl || item.imageUrl,
    };
  });
}

export async function adminCreateWorkItem(payload: {
  topic: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
}): Promise<ManagedWorkItem> {
  const session = await ensureAdminSession();
  const body = {
    title: payload.topic,
    description: encodeWorkDescription({
      description: payload.description,
      beforeImageUrl: payload.beforeImageUrl,
      afterImageUrl: payload.afterImageUrl,
    }),
    imageUrl: payload.afterImageUrl,
    category: 'Work',
  };

  const { data } = await api.post('/gallery', body, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const item = data.data;
  return {
    id: item.id,
    topic: item.title,
    description: payload.description,
    beforeImageUrl: payload.beforeImageUrl,
    afterImageUrl: payload.afterImageUrl,
  };
}

export async function adminUpdateWorkItem(
  id: string,
  payload: {
    topic: string;
    description: string;
    beforeImageUrl: string;
    afterImageUrl: string;
  },
): Promise<ManagedWorkItem> {
  const session = await ensureAdminSession();
  const body = {
    title: payload.topic,
    description: encodeWorkDescription({
      description: payload.description,
      beforeImageUrl: payload.beforeImageUrl,
      afterImageUrl: payload.afterImageUrl,
    }),
    imageUrl: payload.afterImageUrl,
    category: 'Work',
  };

  await api.put(`/gallery/${id}`, body, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  return {
    id,
    topic: payload.topic,
    description: payload.description,
    beforeImageUrl: payload.beforeImageUrl,
    afterImageUrl: payload.afterImageUrl,
  };
}

export async function adminDeleteWorkItem(id: string): Promise<void> {
  const session = await ensureAdminSession();
  await api.delete(`/gallery/${id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
}

export async function adminGetUsers(): Promise<ManagedUser[]> {
  const data = await withAdminRetry(async (accessToken) => {
    const response = await api.get('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  });

  const rows = data.data || [];
  return rows.map((item: any) => ({
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    phoneNumber: item.phoneNumber,
    role: item.role,
    isActive: item.isActive,
    createdAt: item.createdAt,
  }));
}

export async function adminCreateUser(payload: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  role: 'ADMIN' | 'CLIENT';
}): Promise<ManagedUser> {
  const data = await withAdminRetry(async (accessToken) => {
    const response = await api.post('/users', payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  });

  const item = data.data;
  return {
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    phoneNumber: item.phoneNumber,
    role: item.role,
    isActive: item.isActive,
    createdAt: item.createdAt,
  };
}

export async function adminUpdateUser(
  id: string,
  payload: Partial<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'ADMIN' | 'CLIENT';
    isActive: boolean;
  }>,
): Promise<ManagedUser> {
  const data = await withAdminRetry(async (accessToken) => {
    const response = await api.put(`/users/${id}`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  });

  const item = data.data;
  return {
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    phoneNumber: item.phoneNumber,
    role: item.role,
    isActive: item.isActive,
    createdAt: item.createdAt,
  };
}

export async function adminDeleteUser(id: string): Promise<void> {
  await withAdminRetry(async (accessToken) => {
    await api.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return true;
  });
}

export async function adminGetDashboardStats(date?: string): Promise<AdminDashboardStats> {
  const data = await withAdminRetry(async (accessToken) => {
    const response = await api.get('/session/dashboard', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: date ? { date } : undefined,
    });
    return response.data;
  });

  return data.data;
}

export default api;
