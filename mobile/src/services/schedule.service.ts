import {
  collection, query, where, orderBy, getDocs, getDoc, doc, documentId,
} from 'firebase/firestore';
import { db, callFunction, tsToString } from './api';
import { Schedule, ScheduleSummary, AvailableDay, TimeSlot } from '../types';

// ─── Helpers ─────────────────────────────────────────

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

// ─── Service ─────────────────────────────────────────

export const scheduleApi = {
  getByDate: async (date: string): Promise<Schedule | null> => {
    const snap = await getDoc(doc(db, 'schedules', date));
    if (!snap.exists()) return null;
    const d = snap.data();

    // Generate slots and check bookings
    const allSlots = generateTimeSlots(d.startTime, d.endTime, d.slotDurationMins);

    const apptSnap = await getDocs(
      query(
        collection(db, 'appointments'),
        where('date', '==', date),
        where('status', 'in', ['BOOKED', 'IN_SERVICE']),
      ),
    );
    const bookedSet = new Set(apptSnap.docs.map((a) => a.data().timeSlot));

    const slots: TimeSlot[] = allSlots.map((time) => ({
      time,
      available: !bookedSet.has(time),
    }));

    return {
      id: snap.id,
      date,
      status: d.status,
      startTime: d.startTime,
      endTime: d.endTime,
      slotDurationMins: d.slotDurationMins,
      totalSlots: allSlots.length,
      availableSlots: allSlots.length - bookedSet.size,
      bookedSlots: bookedSet.size,
      slots,
    };
  },

  getRange: async (startDate?: string, endDate?: string): Promise<ScheduleSummary[]> => {
    let q;
    if (startDate && endDate) {
      q = query(collection(db, 'schedules'), where(documentId(), '>=', startDate), where(documentId(), '<=', endDate));
    } else {
      q = query(collection(db, 'schedules'), orderBy(documentId(), 'asc'));
    }
    const snap = await getDocs(q);

    // Fetch appointment counts per date in one go
    const dates = snap.docs.map((d) => d.id);
    const apptCounts: Record<string, number> = {};
    if (dates.length > 0) {
      // Firestore 'in' filter supports max 30 values; chunk if needed
      for (let i = 0; i < dates.length; i += 30) {
        const chunk = dates.slice(i, i + 30);
        const apptSnap = await getDocs(
          query(collection(db, 'appointments'), where('date', 'in', chunk)),
        );
        for (const a of apptSnap.docs) {
          const d = a.data().date;
          apptCounts[d] = (apptCounts[d] || 0) + 1;
        }
      }
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        date: d.id,
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDurationMins: data.slotDurationMins,
        appointmentCount: apptCounts[d.id] || 0,
      };
    });
  },

  getAvailableDays: async (startDate: string, endDate: string): Promise<AvailableDay[]> => {
    const schedSnap = await getDocs(
      query(
        collection(db, 'schedules'),
        where(documentId(), '>=', startDate),
        where(documentId(), '<=', endDate),
      ),
    );

    // Fetch all active appointments in the range
    const dates = schedSnap.docs.map((d) => d.id);
    const bookedPerDate: Record<string, number> = {};
    if (dates.length > 0) {
      for (let i = 0; i < dates.length; i += 30) {
        const chunk = dates.slice(i, i + 30);
        const apptSnap = await getDocs(
          query(
            collection(db, 'appointments'),
            where('date', 'in', chunk),
            where('status', 'in', ['BOOKED', 'IN_SERVICE']),
          ),
        );
        for (const a of apptSnap.docs) {
          const d = a.data().date;
          bookedPerDate[d] = (bookedPerDate[d] || 0) + 1;
        }
      }
    }

    return schedSnap.docs
      .filter((d) => d.data().status === 'OPEN')
      .map((d) => {
        const data = d.data();
        const totalSlots = generateTimeSlots(data.startTime, data.endTime, data.slotDurationMins).length;
        const booked = bookedPerDate[d.id] || 0;
        return {
          date: d.id,
          status: data.status,
          startTime: data.startTime,
          endTime: data.endTime,
          slotDurationMins: data.slotDurationMins,
          totalSlots,
          availableSlots: totalSlots - booked,
        };
      });
  },

  upsert: async (
    data: { date: string; status: string; startTime: string; endTime: string; slotDurationMins: number },
    forceSlotChange = false,
  ): Promise<Schedule> => {
    const result = await callFunction<any>('upsertSchedule', { ...data, forceSlotChange });
    // Compute real slot counts from the returned schedule
    const totalSlots = result.startTime && result.endTime && result.slotDurationMins
      ? generateTimeSlots(result.startTime, result.endTime, result.slotDurationMins).length
      : 0;
    return { ...result, totalSlots, availableSlots: totalSlots, bookedSlots: 0, slots: [] };
  },

  // Aliases used by admin screens
  getScheduleByDate: async (date: string): Promise<Schedule | null> => {
    return scheduleApi.getByDate(date);
  },

  getScheduleRange: async (startDate: string, endDate: string): Promise<ScheduleSummary[]> => {
    return scheduleApi.getRange(startDate, endDate);
  },

  upsertSchedule: async (data: Record<string, unknown>, forceSlotChange = false): Promise<Schedule> => {
    return scheduleApi.upsert(data as any, forceSlotChange);
  },
};
