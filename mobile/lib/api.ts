import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { Appointment, Service, Story } from './types';

// ─── IST timezone helpers (UTC+5:30) ──────────────────────────────────────
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function getNowIST(): Date { return new Date(Date.now() + IST_OFFSET_MS); }
export function getTodayIST(): string {
  const d = getNowIST();
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-');
}
export function getMaxDateIST(daysAhead = 5): string {
  const d = getNowIST();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-');
}
function getCurrentISTMinutes(): number {
  const d = getNowIST();
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

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
  currentlyServing: { id: string; name: string; timeSlot: string; phoneNumber: string } | null;
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

export type { SessionState, SessionUser };

// Use env variable or fallback — update this for your production server
const DEFAULT_API_URL =
  Platform.OS === 'web' ? 'http://localhost:4000/api' : 'http://10.0.2.2:4000/api';
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) || DEFAULT_API_URL;
const SESSION_STORAGE_KEY = 'salon_session_v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// ─── Storage helpers (AsyncStorage is async, unlike localStorage) ──────────

let cachedSession: SessionState | null | undefined = undefined; // undefined = not loaded yet

export async function getStoredSession(): Promise<SessionState | null> {
  if (cachedSession !== undefined) return cachedSession;
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    cachedSession = raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

async function setStoredSession(session: SessionState): Promise<void> {
  cachedSession = session;
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  cachedSession = null;
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}

export function invalidateSessionCache(): void {
  cachedSession = undefined;
}

// ─── Axios interceptor — attach auth token ─────────────────────────────────

client.interceptors.request.use(async (config) => {
  const session = await getStoredSession();
  if (session?.accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function extractData<T>(response: { data?: { data?: T } }): T {
  return (response.data?.data ?? null) as T;
}

function mapSessionUser(raw: any): SessionUser {
  return {
    id: String(raw.id || raw._id),
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    phoneNumber: raw.phoneNumber || '',
    role: raw.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
    profileImageUrl: raw.profileImageUrl ?? null,
  };
}

function mapService(raw: any): Service {
  return {
    id: String(raw.id || raw._id),
    name: raw.name || 'Service',
    description: raw.description || '',
    price: Number(raw.price || 0),
    durationMins: Number(raw.durationMinutes || raw.durationMins || raw.duration || 30),
    isActive: raw.isActive !== false,
  };
}

function mapManagedService(raw: any): ManagedService {
  return {
    id: String(raw.id || raw._id),
    name: raw.name || 'Service',
    description: raw.description || '',
    duration: Number(raw.durationMinutes || raw.durationMins || raw.duration || 30),
    price: Number(raw.price || 0),
    category: raw.category || 'HAIRCUT',
    isActive: raw.isActive !== false,
  };
}

function mapBookingToManagedAppointment(raw: any): ManagedAppointment {
  return {
    id: String(raw.id || raw._id),
    date: raw.date,
    timeSlot: raw.timeSlot || raw.time,
    status: raw.status,
    userId: raw.userId || `phone_${raw.phone}`,
    userName: raw.userName || raw.fullName || 'Client',
    phoneNumber: raw.phone || raw.phoneNumber || '',
    isReserved: Boolean(raw.isReserved),
  };
}

function mapBookingToAppointment(raw: any): Appointment {
  const status = raw.status === 'IN_SERVICE' ? 'BOOKED' : raw.status;
  return {
    id: String(raw.id || raw._id),
    userId: raw.userId || `phone_${raw.phone}`,
    date: raw.date,
    timeSlot: raw.timeSlot || raw.time,
    status,
    queuePosition: raw.queuePosition || 0,
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function getCurrentSession(): Promise<SessionState | null> {
  return getStoredSession();
}

export async function isSessionAuthenticated(): Promise<boolean> {
  const s = await getStoredSession();
  return Boolean(s?.accessToken);
}

export async function loginWithPhone(phoneNumber: string, password: string): Promise<SessionState> {
  const response = await client.post('/auth/login', { phoneNumber, password });
  const data = extractData<any>(response);
  const session: SessionState = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: mapSessionUser(data.user),
  };
  await setStoredSession(session);
  return session;
}

export async function registerClient(payload: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}): Promise<SessionState> {
  const response = await client.post('/auth/register', payload);
  const data = extractData<any>(response);
  const session: SessionState = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: mapSessionUser(data.user),
  };
  await setStoredSession(session);
  return session;
}

export async function logoutCurrentSession(): Promise<void> {
  const session = await getStoredSession();
  if (session?.refreshToken) {
    try {
      await client.post('/auth/logout', { refreshToken: session.refreshToken });
    } catch {
      // no-op — clear local regardless
    }
  }
  await clearStoredSession();
}

export async function ensureSession(): Promise<SessionState> {
  const session = await getStoredSession();
  if (!session) throw new Error('Not authenticated');
  return session;
}

export async function ensureAdminSession(): Promise<SessionState> {
  const session = await ensureSession();
  if (session.user.role !== 'ADMIN') throw new Error('Admin access required');
  return session;
}

// ─── Profile ───────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<SessionUser> {
  await ensureSession();
  const response = await client.get('/users/profile');
  return mapSessionUser(extractData<any>(response));
}

export async function updateMyProfile(payload: {
  firstName?: string;
  lastName?: string;
  password?: string;
  profileImageUrl?: string | null;
}): Promise<SessionUser> {
  await ensureSession();
  const response = await client.put('/users/profile', payload);
  const updatedUser = mapSessionUser(extractData<any>(response));
  const current = await getStoredSession();
  if (current) await setStoredSession({ ...current, user: updatedUser });
  return updatedUser;
}

// ─── Services ──────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const response = await client.get('/services');
  return (extractData<any[]>(response) || []).map(mapService);
}

export async function adminGetServices(): Promise<ManagedService[]> {
  await ensureAdminSession();
  const response = await client.get('/services', { params: { includeInactive: true } });
  return (extractData<any[]>(response) || []).map(mapManagedService);
}

export async function adminCreateService(payload: {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
}): Promise<ManagedService> {
  await ensureAdminSession();
  const response = await client.post('/services', payload);
  return mapManagedService(extractData<any>(response));
}

export async function adminUpdateService(
  id: string,
  payload: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
    isActive: boolean;
  },
): Promise<ManagedService> {
  await ensureAdminSession();
  const response = await client.put(`/services/${id}`, payload);
  return mapManagedService(extractData<any>(response));
}

export async function adminDeleteService(id: string): Promise<void> {
  await ensureAdminSession();
  await client.delete(`/services/${id}`);
}

// ─── Schedule ──────────────────────────────────────────────────────────────

export async function getClientScheduleByDate(date: string): Promise<{
  date: string;
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
  slots: Array<{ time: string; available: boolean }>;
} | null> {
  const scheduleResponse = await client.get(`/schedule/${date}`);
  const schedule = extractData<any>(scheduleResponse);

  const fallback = { date, status: 'OPEN' as const, startTime: '09:00', endTime: '18:00', slotDurationMins: 30 };
  const target = schedule || fallback;

  if (target.status !== 'OPEN') return { ...target, slots: [] };

  const slotsResponse = await client.get('/time-slots', { params: { date } });
  const bookedTimes = new Set((extractData<string[]>(slotsResponse) || []) as string[]);

  const parseMinutes = (t: string) => {
    const [h, m] = String(t).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const slots: Array<{ time: string; available: boolean }> = [];
  const start = parseMinutes(target.startTime);
  const end = parseMinutes(target.endTime);
  const step = Number(target.slotDurationMins || 30);

  for (let min = start; min < end; min += step) {
    const hh = String(Math.floor(min / 60)).padStart(2, '0');
    const mm = String(min % 60).padStart(2, '0');
    const time = `${hh}:${mm}`;
    slots.push({ time, available: !bookedTimes.has(time) });
  }

  // Disable past time slots when the selected date is today in IST
  if (date === getTodayIST()) {
    const nowMins = getCurrentISTMinutes();
    for (let i = 0; i < slots.length; i++) {
      const [h, m] = slots[i].time.split(':').map(Number);
      if (h * 60 + m <= nowMins) {
        slots[i] = { ...slots[i], available: false };
      }
    }
  }

  return { ...target, slots };
}

export async function upsertDaySchedule(payload: {
  date: string;
  status: 'OPEN' | 'CLOSED';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
}): Promise<void> {
  await ensureAdminSession();
  await client.put('/schedule', payload);
}

export async function adminGetScheduleRange(startDate: string, endDate: string): Promise<ManagedScheduleDay[]> {
  await ensureAdminSession();
  const response = await client.get('/schedule', { params: { startDate, endDate } });
  return (extractData<any[]>(response) || []).map((row) => ({
    date: row.date,
    status: row.status,
    startTime: row.startTime,
    endTime: row.endTime,
    slotDurationMins: Number(row.slotDurationMins || 30),
  }));
}

export async function getScheduleDays(startDate: string, endDate: string): Promise<Array<{ date: string; status: string }>> {
  await ensureSession();
  const response = await client.get('/schedule', { params: { startDate, endDate } });
  return (extractData<any[]>(response) || []).map((row) => ({
    date: row.date as string,
    status: row.status as string,
  }));
}

// ─── Session management ────────────────────────────────────────────────────

export async function openDaySession(date: string): Promise<void> {
  await ensureAdminSession();
  await client.post('/session/open', { date });
}

export async function adminCloseSession(date: string): Promise<void> {
  await ensureAdminSession();
  await client.put('/session/close', null, { params: { date } });
}

export async function adminGetDashboardStats(date?: string): Promise<AdminDashboardStats> {
  await ensureAdminSession();
  const response = await client.get('/session/dashboard', { params: { date } });
  return extractData<AdminDashboardStats>(response);
}

// ─── Appointments ──────────────────────────────────────────────────────────

export async function getMyAppointments(): Promise<Appointment[]> {
  await ensureSession();
  const response = await client.get('/appointments/my');
  return (extractData<any[]>(response) || []).map(mapBookingToAppointment);
}

export async function createAppointment(payload: { date: string; timeSlot: string }): Promise<Appointment> {
  await ensureSession();
  const response = await client.post('/appointments', payload);
  return mapBookingToAppointment(extractData<any>(response));
}

export async function cancelMyAppointment(id: string): Promise<void> {
  await ensureSession();
  await client.put(`/appointments/${id}/cancel`);
}

export async function adminGetAppointments(filters?: {
  date?: string;
  status?: ManagedAppointment['status'];
}): Promise<ManagedAppointment[]> {
  await ensureAdminSession();
  const response = await client.get('/appointments', { params: filters });
  return (extractData<any[]>(response) || []).map(mapBookingToManagedAppointment);
}

export async function adminDeleteAppointment(id: string): Promise<void> {
  await ensureAdminSession();
  await client.delete(`/appointments/${id}`);
}

export async function adminCompleteAppointment(id: string): Promise<void> {
  await ensureAdminSession();
  await client.put(`/appointments/${id}/complete`);
}

export async function adminCreateReservedAppointment(payload: {
  date: string;
  timeSlot: string;
  userId?: string;
  notes?: string;
}): Promise<void> {
  await ensureAdminSession();
  await client.post('/appointments/reserve', payload);
}

export async function submitBookingRequest(payload: {
  fullName: string;
  email: string;
  phone: string;
  serviceName: string;
  date: string;
  time: string;
  notes?: string;
}): Promise<void> {
  await client.post('/bookings', payload);
}

// ─── Queue ─────────────────────────────────────────────────────────────────

export async function getLiveQueue(date?: string): Promise<LiveQueueResponse> {
  await ensureSession();
  const response = await client.get('/queue', { params: { date } });
  return extractData<LiveQueueResponse>(response);
}

export async function adminReorderQueue(date: string, orderedIds: string[]): Promise<void> {
  await ensureAdminSession();
  await client.put('/queue/reorder', { date, orderedIds });
}

// ─── Gallery / Work ────────────────────────────────────────────────────────

export async function getStories(): Promise<Story[]> {
  const response = await client.get('/gallery');
  const rows = extractData<any[]>(response) || [];
  if (rows.length === 0) return [];
  if (typeof rows[0] === 'string') {
    return rows.map((url: string, i: number) => ({
      id: `story-${i + 1}`,
      beforeImageUrl: url,
      afterImageUrl: url,
      caption: `Transformation ${i + 1}`,
    }));
  }
  return rows.map((row: any) => {
    let parsed: { beforeImageUrl?: string; afterImageUrl?: string; description?: string } = {};
    try { parsed = row.description ? JSON.parse(row.description) : {}; } catch { parsed = {}; }
    return {
      id: String(row.id || row._id),
      beforeImageUrl: parsed.beforeImageUrl || row.imageUrl,
      afterImageUrl: parsed.afterImageUrl || row.imageUrl,
      caption: row.title || parsed.description || 'Salon transformation',
    };
  });
}

export async function adminGetWorkItems(): Promise<ManagedWorkItem[]> {
  await ensureAdminSession();
  const response = await client.get('/gallery', { params: { includeInactive: true } });
  return (extractData<any[]>(response) || [])
    .filter((row) => typeof row === 'object')
    .map((row) => {
      let parsed: { description?: string; beforeImageUrl?: string; afterImageUrl?: string } = {};
      try { parsed = row.description ? JSON.parse(row.description) : {}; } catch { parsed = {}; }
      return {
        id: String(row.id || row._id),
        topic: row.title || '',
        description: parsed.description || '',
        beforeImageUrl: parsed.beforeImageUrl || row.imageUrl,
        afterImageUrl: parsed.afterImageUrl || row.imageUrl,
      };
    });
}

export async function adminCreateWorkItem(payload: {
  topic: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
}): Promise<ManagedWorkItem> {
  await ensureAdminSession();
  const response = await client.post('/gallery', {
    title: payload.topic,
    category: 'Work',
    description: JSON.stringify({
      description: payload.description,
      beforeImageUrl: payload.beforeImageUrl,
      afterImageUrl: payload.afterImageUrl,
    }),
    imageUrl: payload.afterImageUrl,
    isActive: true,
  });
  const row = extractData<any>(response);
  return {
    id: String(row.id || row._id),
    topic: row.title || payload.topic,
    description: payload.description,
    beforeImageUrl: payload.beforeImageUrl,
    afterImageUrl: payload.afterImageUrl,
  };
}

export async function adminUpdateWorkItem(
  id: string,
  payload: { topic: string; description: string; beforeImageUrl: string; afterImageUrl: string },
): Promise<ManagedWorkItem> {
  await ensureAdminSession();
  const response = await client.put(`/gallery/${id}`, {
    title: payload.topic,
    category: 'Work',
    description: JSON.stringify({
      description: payload.description,
      beforeImageUrl: payload.beforeImageUrl,
      afterImageUrl: payload.afterImageUrl,
    }),
    imageUrl: payload.afterImageUrl,
    isActive: true,
  });
  const row = extractData<any>(response);
  return {
    id: String(row.id || row._id),
    topic: row.title || payload.topic,
    description: payload.description,
    beforeImageUrl: payload.beforeImageUrl,
    afterImageUrl: payload.afterImageUrl,
  };
}

export async function adminDeleteWorkItem(id: string): Promise<void> {
  await ensureAdminSession();
  await client.delete(`/gallery/${id}`);
}

// ─── Users ─────────────────────────────────────────────────────────────────

export async function adminGetUsers(): Promise<ManagedUser[]> {
  await ensureAdminSession();
  const response = await client.get('/users');
  return (extractData<any[]>(response) || []).map((row) => ({
    id: String(row.id || row._id),
    firstName: row.firstName,
    lastName: row.lastName,
    phoneNumber: row.phoneNumber,
    role: row.role,
    isActive: row.isActive !== false,
    createdAt: new Date(row.createdAt || Date.now()).toISOString(),
  }));
}

export async function adminCreateUser(payload: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  role: 'ADMIN' | 'CLIENT';
}): Promise<ManagedUser> {
  await ensureAdminSession();
  const response = await client.post('/users', payload);
  const row = extractData<any>(response);
  return {
    id: String(row.id || row._id),
    firstName: row.firstName,
    lastName: row.lastName,
    phoneNumber: row.phoneNumber,
    role: row.role,
    isActive: row.isActive !== false,
    createdAt: new Date(row.createdAt || Date.now()).toISOString(),
  };
}

export async function adminUpdateUser(
  id: string,
  payload: { firstName: string; lastName: string; phoneNumber: string; role: 'ADMIN' | 'CLIENT'; isActive: boolean },
): Promise<ManagedUser> {
  await ensureAdminSession();
  const response = await client.put(`/users/${id}`, payload);
  const row = extractData<any>(response);
  return {
    id: String(row.id || row._id),
    firstName: row.firstName,
    lastName: row.lastName,
    phoneNumber: row.phoneNumber,
    role: row.role,
    isActive: row.isActive !== false,
    createdAt: new Date(row.createdAt || Date.now()).toISOString(),
  };
}

export async function adminDeleteUser(id: string): Promise<void> {
  await ensureAdminSession();
  await client.delete(`/users/${id}`);
}
