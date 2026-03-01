import {
  collection, query, where, getDocs, getDoc, doc,
} from 'firebase/firestore';
import { db, callFunction, tsToString } from './api';
import { Session, DashboardStats } from '../types';

function getTodayString(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export const sessionApi = {
  getSession: async (date?: string): Promise<Session> => {
    const targetDate = date || getTodayString();
    const snap = await getDoc(doc(db, 'sessions', targetDate));

    if (!snap.exists()) {
      return { date: targetDate, isClosed: false, exists: false, openedAt: null, closedAt: null };
    }
    const d = snap.data();
    return {
      id: snap.id,
      date: targetDate,
      isClosed: d.isClosed ?? false,
      exists: true,
      openedAt: tsToString(d.openedAt) || null,
      closedAt: d.closedAt ? tsToString(d.closedAt) : null,
    };
  },

  openSession: async (date: string): Promise<Session> => {
    return callFunction<Session>('manageSession', { action: 'open', date });
  },

  closeSession: async (date?: string): Promise<Session> => {
    return callFunction<Session>('manageSession', { action: 'close', date });
  },

  getDashboardStats: async (date?: string): Promise<DashboardStats> => {
    const targetDate = date || getTodayString();

    // Session status
    const sessionDoc = await getDoc(doc(db, 'sessions', targetDate));
    const scheduleDoc = await getDoc(doc(db, 'schedules', targetDate));

    let sessionStatus: DashboardStats['sessionStatus'] = 'NO_SCHEDULE';
    if (scheduleDoc.exists() && scheduleDoc.data()?.status === 'OPEN') {
      sessionStatus = sessionDoc.exists() && !sessionDoc.data()?.isClosed ? 'OPEN' : 'CLOSED';
    }

    // Appointment counts
    const apptSnap = await getDocs(
      query(collection(db, 'appointments'), where('date', '==', targetDate)),
    );

    let totalAppointments = 0;
    let inQueue = 0;
    let inService = 0;
    let completed = 0;
    let cancelled = 0;
    let noShow = 0;

    for (const d of apptSnap.docs) {
      const data = d.data();
      totalAppointments++;
      switch (data.status) {
        case 'BOOKED': inQueue++; break;
        case 'IN_SERVICE': inService++; break;
        case 'COMPLETED': completed++; break;
        case 'CANCELLED': cancelled++; break;
        case 'NO_SHOW': noShow++; break;
      }
    }

    return {
      date: targetDate,
      sessionStatus,
      totalAppointments,
      inQueue,
      inService,
      completed,
      cancelled,
      noShow,
    };
  },
};
