import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firebaseAuth, firebaseDb, firebaseFunctions } from './firebase';
import { Appointment, Service, Story } from './types';

// ─── Types ───────────────────────────────────────────────────────────

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

export type { SessionState, SessionUser };

// ─── Helpers ─────────────────────────────────────────────────────────

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

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function tsToISO(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  if (typeof ts === 'number') return new Date(ts).toISOString();
  return new Date().toISOString();
}

function generateTimeSlots(startTime: string, endTime: string, slotDurationMins: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    current += slotDurationMins;
  }
  return slots;
}

// ─── Firebase Auth helpers ───────────────────────────────────────────

async function waitForAuth(): Promise<string | null> {
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser.uid;
  return new Promise((resolve) => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user?.uid ?? null);
    });
  });
}

async function ensureAuth(): Promise<string> {
  const uid = await waitForAuth();
  if (uid) return uid;
  throw new Error('Not authenticated');
}

async function ensureAdminAuth(): Promise<void> {
  const uid = await waitForAuth();
  const session = getStoredSession();
  if (uid && session?.user?.role === 'ADMIN') return;

  const adminPhone = import.meta.env.VITE_ADMIN_PHONE || '0712345678';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin12345';
  await loginWithFirebaseAuth(adminPhone, adminPassword);
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

// ─── Callable references ─────────────────────────────────────────────

const callRegisterUser = httpsCallable(firebaseFunctions, 'registerUser');
const callUpdateProfile = httpsCallable(firebaseFunctions, 'updateProfile');
const callAdminManageUser = httpsCallable(firebaseFunctions, 'adminManageUser');
const callBookAppointment = httpsCallable(firebaseFunctions, 'bookAppointment');
const callCancelAppointment = httpsCallable(firebaseFunctions, 'cancelAppointment');
const callAdminUpdateAppointment = httpsCallable(firebaseFunctions, 'adminUpdateAppointment');
const callReorderQueue = httpsCallable(firebaseFunctions, 'reorderQueue');
const callManageSession = httpsCallable(firebaseFunctions, 'manageSession');
const callUpsertSchedule = httpsCallable(firebaseFunctions, 'upsertSchedule');
const callAdminManageService = httpsCallable(firebaseFunctions, 'adminManageService');
const callAdminManageGallery = httpsCallable(firebaseFunctions, 'adminManageGallery');

// ─── Session management ─────────────────────────────────────────────

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
  return loginWithFirebaseAuth(phoneNumber, password);
}

export async function ensureSession(): Promise<SessionState> {
  await ensureAuth();
  const existing = getStoredSession();
  if (existing?.accessToken) return existing;
  throw new Error('Not authenticated');
}

export async function ensureAdminSession(): Promise<SessionState> {
  await ensureAdminAuth();
  return getStoredSession()!;
}

export async function logoutCurrentSession(): Promise<void> {
  clearStoredSession();
  try {
    await signOut(firebaseAuth);
  } catch {
    /* swallow */
  }
}

export async function registerClient(payload: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}): Promise<SessionState> {
  await callRegisterUser({
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
  });
  return loginWithFirebaseAuth(payload.phoneNumber, payload.password);
}

// ─── Profile ────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<SessionUser> {
  const uid = await ensureAuth();
  const userDoc = await getDoc(doc(firebaseDb, 'users', uid));
  if (!userDoc.exists()) throw new Error('Profile not found');
  const data = userDoc.data()!;
  return {
    id: uid,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phoneNumber: data.phoneNumber || '',
    role: data.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
    profileImageUrl: data.profileImageUrl || null,
  };
}

export async function updateMyProfile(payload: {
  firstName?: string;
  lastName?: string;
  password?: string;
  profileImageUrl?: string | null;
}): Promise<SessionUser> {
  await ensureAuth();
  const result = await callUpdateProfile(payload);
  const data = result.data as any;
  const updated: SessionUser = {
    id: data.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phoneNumber: data.phoneNumber || '',
    role: data.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
    profileImageUrl: data.profileImageUrl || null,
  };
  const session = getStoredSession();
  if (session) setStoredSession({ ...session, user: updated });
  return updated;
}

// ─── Schedule ───────────────────────────────────────────────────────

export async function getScheduleByDate(date: string): Promise<{
  date: string;
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
} | null> {
  await ensureAuth();
  const snap = await getDoc(doc(firebaseDb, 'schedules', date));
  if (!snap.exists()) return null;
  const d = snap.data()!;
  return { date, status: d.status, startTime: d.startTime, endTime: d.endTime, slotDurationMins: d.slotDurationMins };
}

export async function getClientScheduleByDate(date: string): Promise<{
  date: string;
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
  slots: Array<{ time: string; available: boolean }>;
} | null> {
  // schedules are public-read; no auth needed
  const snap = await getDoc(doc(firebaseDb, 'schedules', date));
  if (!snap.exists()) return null;
  const d = snap.data()!;
  if (d.status !== 'OPEN') return null;
  const allSlots = generateTimeSlots(d.startTime, d.endTime, d.slotDurationMins);

  // Try to check taken slots; appointments require auth so fall back to all-available for anonymous users
  let takenSlots = new Set<string>();
  try {
    const appointmentsSnap = await getDocs(
      query(collection(firebaseDb, 'appointments'), where('date', '==', date)),
    );
    takenSlots = new Set(
      appointmentsSnap.docs
        .filter((a) => ['BOOKED', 'IN_SERVICE'].includes(a.data().status))
        .map((a) => a.data().timeSlot),
    );
  } catch {
    // anonymous user — show all slots as available; server validates on booking
  }

  return {
    date,
    status: d.status,
    startTime: d.startTime,
    endTime: d.endTime,
    slotDurationMins: d.slotDurationMins,
    slots: allSlots.map((time) => ({ time, available: !takenSlots.has(time) })),
  };
}

export async function upsertDaySchedule(payload: {
  date: string;
  status: 'OPEN' | 'CLOSED';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
}): Promise<void> {
  await ensureAdminAuth();
  await callUpsertSchedule(payload);
}

export async function adminGetScheduleRange(startDate: string, endDate: string): Promise<ManagedScheduleDay[]> {
  await ensureAdminAuth();
  const snap = await getDocs(collection(firebaseDb, 'schedules'));
  return snap.docs
    .filter((d) => d.id >= startDate && d.id <= endDate)
    .map((d) => {
      const data = d.data();
      return {
        date: d.id,
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDurationMins: data.slotDurationMins,
      };
    });
}

// ─── Session (open / close day) ─────────────────────────────────────

export async function openDaySession(date: string): Promise<void> {
  await ensureAdminAuth();
  await callManageSession({ action: 'open', date });
}

export async function adminCloseSession(date: string): Promise<void> {
  await ensureAdminAuth();
  await callManageSession({ action: 'close', date });
}

// ─── Services ───────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const snap = await getDocs(collection(firebaseDb, 'services'));
  return snap.docs
    .filter((d) => d.data().isActive !== false)
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || '',
        description: data.description || '',
        price: Number(data.price),
        durationMins: data.duration || 30,
        isActive: data.isActive ?? true,
      };
    });
}

export async function adminGetServices(): Promise<ManagedService[]> {
  await ensureAdminAuth();
  const snap = await getDocs(collection(firebaseDb, 'services'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || '',
      description: data.description || '',
      duration: data.duration || 30,
      price: Number(data.price),
      category: data.category || 'HAIRCUT',
      isActive: data.isActive ?? true,
    };
  });
}

export async function adminCreateService(payload: {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
}): Promise<ManagedService> {
  await ensureAdminAuth();
  const result = await callAdminManageService({ action: 'create', ...payload });
  const data = result.data as any;
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    duration: data.duration,
    price: Number(data.price),
    category: data.category || 'HAIRCUT',
    isActive: data.isActive ?? true,
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
  }>,
): Promise<ManagedService> {
  await ensureAdminAuth();
  const result = await callAdminManageService({ action: 'update', serviceId: id, ...payload });
  const data = result.data as any;
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    duration: data.duration,
    price: Number(data.price),
    category: data.category || 'HAIRCUT',
    isActive: data.isActive ?? true,
  };
}

export async function adminDeleteService(id: string): Promise<void> {
  await ensureAdminAuth();
  await callAdminManageService({ action: 'delete', serviceId: id });
}

// ─── Gallery / Stories ──────────────────────────────────────────────

function decodeWorkDescription(raw?: string) {
  if (!raw) return { description: '', beforeImageUrl: '', afterImageUrl: '' };
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
    /* not JSON */
  }
  return { description: raw, beforeImageUrl: '', afterImageUrl: '' };
}

function encodeWorkDescription(payload: { description: string; beforeImageUrl: string; afterImageUrl: string }): string {
  return JSON.stringify(payload);
}

export async function getStories(): Promise<Story[]> {
  const snap = await getDocs(collection(firebaseDb, 'gallery'));
  return snap.docs
    .filter((d) => d.data().isActive !== false)
    .map((d) => {
      const data = d.data();
      const meta = decodeWorkDescription(data.description);
      return {
        id: d.id,
        beforeImageUrl: meta.beforeImageUrl || '',
        afterImageUrl: meta.afterImageUrl || data.imageUrl || '',
        caption: data.title || '',
      };
    });
}

export async function adminGetWorkItems(): Promise<ManagedWorkItem[]> {
  await ensureAdminAuth();
  const snap = await getDocs(collection(firebaseDb, 'gallery'));
  return snap.docs.map((d) => {
    const data = d.data();
    const meta = decodeWorkDescription(data.description);
    return {
      id: d.id,
      topic: data.title || '',
      description: meta.description,
      beforeImageUrl: meta.beforeImageUrl,
      afterImageUrl: meta.afterImageUrl || data.imageUrl || '',
    };
  });
}

export async function adminCreateWorkItem(payload: {
  topic: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
}): Promise<ManagedWorkItem> {
  await ensureAdminAuth();
  const result = await callAdminManageGallery({
    action: 'create',
    title: payload.topic,
    description: encodeWorkDescription({
      description: payload.description,
      beforeImageUrl: payload.beforeImageUrl,
      afterImageUrl: payload.afterImageUrl,
    }),
    imageUrl: payload.afterImageUrl,
    category: 'Work',
  });
  const data = result.data as any;
  return {
    id: data.id,
    topic: data.title || payload.topic,
    description: payload.description,
    beforeImageUrl: payload.beforeImageUrl,
    afterImageUrl: payload.afterImageUrl,
  };
}

export async function adminUpdateWorkItem(
  id: string,
  payload: { topic: string; description: string; beforeImageUrl: string; afterImageUrl: string },
): Promise<ManagedWorkItem> {
  await ensureAdminAuth();
  await callAdminManageGallery({
    action: 'update',
    galleryId: id,
    title: payload.topic,
    description: encodeWorkDescription({
      description: payload.description,
      beforeImageUrl: payload.beforeImageUrl,
      afterImageUrl: payload.afterImageUrl,
    }),
    imageUrl: payload.afterImageUrl,
    category: 'Work',
  });
  return { id, topic: payload.topic, description: payload.description, beforeImageUrl: payload.beforeImageUrl, afterImageUrl: payload.afterImageUrl };
}

export async function adminDeleteWorkItem(id: string): Promise<void> {
  await ensureAdminAuth();
  await callAdminManageGallery({ action: 'delete', galleryId: id });
}

// ─── Queue ──────────────────────────────────────────────────────────

export async function getLiveQueue(date?: string): Promise<LiveQueueResponse> {
  const targetDate = date || getTodayString();
  try {
    await waitForAuth();

    const [appointmentsSnap, scheduleSnap] = await Promise.all([
      getDocs(query(collection(firebaseDb, 'appointments'), where('date', '==', targetDate))),
      getDoc(doc(firebaseDb, 'schedules', targetDate)),
    ]);

    const slotDuration = scheduleSnap.exists() ? (scheduleSnap.data()!.slotDurationMins || 30) : 30;

    const active = appointmentsSnap.docs
      .filter((d) => ['BOOKED', 'IN_SERVICE'].includes(d.data().status))
      .sort((a, b) => (a.data().queuePosition || 0) - (b.data().queuePosition || 0));

    const userIds = [...new Set(active.map((d) => d.data().userId))];
    const userMap: Record<string, any> = {};
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const u = await getDoc(doc(firebaseDb, 'users', uid));
          if (u.exists()) userMap[uid] = u.data();
        } catch {
          /* missing user */
        }
      }),
    );

    let currentlyServing: LiveQueueResponse['currentlyServing'] = null;
    const queueItems: LiveQueueItem[] = [];

    active.forEach((apptDoc, index) => {
      const appt = apptDoc.data();
      const user = userMap[appt.userId] || {};
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
      const phoneNumber = user.phoneNumber || '';

      if (appt.status === 'IN_SERVICE' && !currentlyServing) {
        currentlyServing = { id: apptDoc.id, name, timeSlot: appt.timeSlot, phoneNumber };
      }

      queueItems.push({
        id: apptDoc.id,
        position: appt.queuePosition || index + 1,
        name,
        userId: appt.userId,
        phoneNumber,
        timeSlot: appt.timeSlot,
        status: appt.status,
        slotDurationMins: slotDuration,
        estimatedWaitMins: index * slotDuration,
      });
    });

    return { date: targetDate, currentlyServing, queue: queueItems, totalInQueue: queueItems.length };
  } catch {
    return { date: targetDate, currentlyServing: null, queue: [], totalInQueue: 0 };
  }
}

export async function adminReorderQueue(date: string, orderedIds: string[]): Promise<void> {
  await ensureAdminAuth();
  await callReorderQueue({ date, orderedIds });
}

// ─── Appointments ───────────────────────────────────────────────────

export async function getMyAppointments(_token?: string): Promise<Appointment[]> {
  const uid = await ensureAuth();
  const snap = await getDocs(
    query(collection(firebaseDb, 'appointments'), where('userId', '==', uid), orderBy('date', 'desc')),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, userId: data.userId, date: data.date, timeSlot: data.timeSlot, status: data.status, queuePosition: data.queuePosition || 0 };
  });
}

export async function createAppointment(payload: { date: string; timeSlot: string }): Promise<Appointment> {
  await ensureAuth();
  const result = await callBookAppointment(payload);
  const data = result.data as any;
  return { id: data.id, userId: data.userId, date: data.date, timeSlot: data.timeSlot, status: data.status, queuePosition: data.queuePosition || 0 };
}

export async function cancelMyAppointment(id: string): Promise<void> {
  await ensureAuth();
  await callCancelAppointment({ appointmentId: id });
}

export async function adminGetAppointments(_filters?: {
  date?: string;
  status?: 'BOOKED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}): Promise<ManagedAppointment[]> {
  await ensureAdminAuth();
  const session = getStoredSession()!;
  const snap = await getDocs(collection(firebaseDb, 'appointments'));

  const userIds = [...new Set(snap.docs.map((d) => d.data().userId))];
  const userMap: Record<string, any> = {};
  await Promise.all(
    userIds.map(async (uid) => {
      try {
        const u = await getDoc(doc(firebaseDb, 'users', uid));
        if (u.exists()) userMap[uid] = u.data();
      } catch {
        /* skip */
      }
    }),
  );

  return snap.docs.map((d) => {
    const data = d.data();
    const user = userMap[data.userId] || {};
    return {
      id: d.id,
      date: data.date,
      timeSlot: data.timeSlot,
      status: data.status,
      userId: data.userId,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      phoneNumber: user.phoneNumber || '',
      isReserved: data.userId === session.user.id,
    };
  });
}

export async function adminCreateReservedAppointment(payload: { date: string; timeSlot: string }): Promise<ManagedAppointment> {
  await ensureAdminAuth();
  const session = getStoredSession()!;
  const result = await callBookAppointment(payload);
  const data = result.data as any;
  return {
    id: data.id,
    date: data.date,
    timeSlot: data.timeSlot,
    status: data.status,
    userId: data.userId || session.user.id,
    userName: 'RESERVED',
    phoneNumber: session.user.phoneNumber,
    isReserved: true,
  };
}

export async function adminDeleteAppointment(id: string): Promise<void> {
  await ensureAdminAuth();
  await callAdminUpdateAppointment({ appointmentId: id, action: 'delete' });
}

export async function adminCompleteAppointment(id: string): Promise<void> {
  await ensureAdminAuth();
  await callAdminUpdateAppointment({ appointmentId: id, action: 'complete' });
}

// ─── Users ──────────────────────────────────────────────────────────

export async function adminGetUsers(): Promise<ManagedUser[]> {
  await ensureAdminAuth();
  const snap = await getDocs(collection(firebaseDb, 'users'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneNumber: data.phoneNumber || '',
      role: data.role || 'CLIENT',
      isActive: data.isActive ?? true,
      createdAt: tsToISO(data.createdAt),
    };
  });
}

export async function adminCreateUser(payload: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  role: 'ADMIN' | 'CLIENT';
}): Promise<ManagedUser> {
  await ensureAdminAuth();
  const result = await callAdminManageUser({ action: 'create', ...payload });
  const data = result.data as any;
  return {
    id: data.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phoneNumber: data.phoneNumber || '',
    role: data.role || 'CLIENT',
    isActive: data.isActive ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
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
  await ensureAdminAuth();
  const result = await callAdminManageUser({ action: 'update', userId: id, ...payload });
  const data = result.data as any;
  return {
    id: data.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phoneNumber: data.phoneNumber || '',
    role: data.role || 'CLIENT',
    isActive: data.isActive ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export async function adminDeleteUser(id: string): Promise<void> {
  await ensureAdminAuth();
  await callAdminManageUser({ action: 'delete', userId: id });
}

// ─── Dashboard ──────────────────────────────────────────────────────

export async function adminGetDashboardStats(_date?: string): Promise<AdminDashboardStats> {
  await ensureAdminAuth();
  const today = _date || getTodayString();

  const [usersSnap, servicesSnap, todayApptsSnap, sessionSnap, scheduleSnap] = await Promise.all([
    getDocs(collection(firebaseDb, 'users')),
    getDocs(collection(firebaseDb, 'services')),
    getDocs(query(collection(firebaseDb, 'appointments'), where('date', '==', today))),
    getDoc(doc(firebaseDb, 'sessions', today)),
    getDoc(doc(firebaseDb, 'schedules', today)),
  ]);

  const registeredUsers = usersSnap.size;
  const activeServices = servicesSnap.docs.filter((d) => d.data().isActive !== false).length;

  const todayAppts = todayApptsSnap.docs.map((d) => d.data());
  const appointmentsToday = todayAppts.length;
  const inQueue = todayAppts.filter((a) => a.status === 'BOOKED' || a.status === 'IN_SERVICE').length;
  const completed = todayAppts.filter((a) => a.status === 'COMPLETED').length;
  const cancelled = todayAppts.filter((a) => a.status === 'CANCELLED').length;
  const noShow = todayAppts.filter((a) => a.status === 'NO_SHOW').length;

  let sessionStatus: 'OPEN' | 'CLOSED' | 'NO_SCHEDULE' = 'NO_SCHEDULE';
  if (scheduleSnap.exists()) {
    const schedule = scheduleSnap.data()!;
    if (schedule.status === 'OPEN') {
      sessionStatus = sessionSnap.exists() && sessionSnap.data()!.isClosed ? 'CLOSED' : 'OPEN';
    } else {
      sessionStatus = 'CLOSED';
    }
  }

  let averageAppointmentTime = 30;
  if (scheduleSnap.exists()) {
    averageAppointmentTime = scheduleSnap.data()!.slotDurationMins || 30;
  }

  // User registration trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const trendMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    trendMap[key] = 0;
  }

  usersSnap.docs.forEach((d) => {
    const createdAt = d.data().createdAt;
    if (createdAt) {
      const date = typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
      if (date >= sevenDaysAgo) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (trendMap[key] !== undefined) trendMap[key]++;
      }
    }
  });

  const userRegistrationTrend = Object.entries(trendMap).map(([day, count]) => ({ day, count }));

  return {
    date: today,
    sessionStatus,
    totalAppointments: appointmentsToday,
    inQueue,
    completed,
    cancelled,
    noShow,
    registeredUsers,
    activeServices,
    appointmentsToday,
    userRegistrationTrend,
    averageAppointmentTime,
  };
}

// ─── Default export (backward compat) ───────────────────────────────

export default {};
