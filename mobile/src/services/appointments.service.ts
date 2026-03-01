import {
  collection, query, where, orderBy, getDocs, getDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db, auth, callFunction, tsToString } from './api';
import { Appointment } from '../types';

/** Map a Firestore doc into the Appointment shape the UI expects. */
function mapAppointment(id: string, d: Record<string, any>, userData?: Record<string, any>): Appointment {
  return {
    id,
    date: d.date,
    timeSlot: d.timeSlot,
    queuePosition: d.queuePosition,
    status: d.status,
    serviceId: d.serviceId ?? undefined,
    user: userData
      ? { id: userData.id, firstName: userData.firstName, lastName: userData.lastName, phoneNumber: userData.phoneNumber }
      : undefined,
    createdAt: tsToString(d.createdAt),
  };
}

export const appointmentsApi = {
  create: async (date: string, timeSlot: string): Promise<Appointment> => {
    return callFunction<Appointment>('bookAppointment', { date, timeSlot });
  },

  getMyAppointments: async (): Promise<Appointment[]> => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapAppointment(d.id, d.data()));
  },

  getAll: async (filters?: { date?: string; status?: string; userId?: string }): Promise<Appointment[]> => {
    let q = query(collection(db, 'appointments'), orderBy('queuePosition', 'asc'));

    // Build constraints dynamically — Firestore requires chaining
    const constraints: any[] = [];
    if (filters?.date) constraints.push(where('date', '==', filters.date));
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    if (filters?.userId) constraints.push(where('userId', '==', filters.userId));

    if (constraints.length) {
      q = query(collection(db, 'appointments'), ...constraints, orderBy('queuePosition', 'asc'));
    }

    const snap = await getDocs(q);
    const appointments = snap.docs.map((d) => mapAppointment(d.id, d.data()));

    // Batch-fetch user data for each appointment
    const userIds = [...new Set(appointments.map((a) => (snap.docs.find((d) => d.id === a.id)?.data() as any)?.userId).filter(Boolean))];
    const userMap: Record<string, any> = {};
    for (const uid of userIds) {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) userMap[uid] = { id: uid, ...userDoc.data() };
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return mapAppointment(d.id, data, userMap[data.userId]);
    });
  },

  getById: async (id: string): Promise<Appointment> => {
    const snap = await getDoc(doc(db, 'appointments', id));
    if (!snap.exists()) throw new Error('Appointment not found');
    const d = snap.data();

    let userData: Record<string, any> | undefined;
    if (d.userId) {
      const userDoc = await getDoc(doc(db, 'users', d.userId));
      if (userDoc.exists()) userData = { id: d.userId, ...userDoc.data() };
    }
    return mapAppointment(id, d, userData);
  },

  cancel: async (id: string): Promise<Appointment> => {
    return callFunction<Appointment>('cancelAppointment', { appointmentId: id });
  },

  complete: async (id: string): Promise<Appointment> => {
    return callFunction<Appointment>('adminUpdateAppointment', { appointmentId: id, action: 'complete' });
  },

  markInService: async (id: string): Promise<Appointment> => {
    return callFunction<Appointment>('adminUpdateAppointment', { appointmentId: id, action: 'in-service' });
  },

  markNoShow: async (id: string): Promise<Appointment> => {
    return callFunction<Appointment>('adminUpdateAppointment', { appointmentId: id, action: 'no-show' });
  },

  update: async (id: string, data: { timeSlot?: string; date?: string; status?: string }): Promise<Appointment> => {
    return callFunction<Appointment>('adminUpdateAppointment', { appointmentId: id, action: 'update', ...data });
  },

  delete: async (id: string): Promise<void> => {
    await callFunction('adminUpdateAppointment', { appointmentId: id, action: 'delete' });
  },

  // Aliases for admin screens
  completeAppointment: async (id: string): Promise<Appointment> => {
    return callFunction<Appointment>('adminUpdateAppointment', { appointmentId: id, action: 'complete' });
  },

  cancelAppointment: async (id: string): Promise<Appointment> => {
    return callFunction<Appointment>('cancelAppointment', { appointmentId: id });
  },

  getAppointments: async (filters?: Record<string, string>): Promise<Appointment[]> => {
    return appointmentsApi.getAll(filters);
  },

  deleteAppointment: async (id: string): Promise<void> => {
    await callFunction('adminUpdateAppointment', { appointmentId: id, action: 'delete' });
  },
};
