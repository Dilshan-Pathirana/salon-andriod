import {
  collection, query, where, orderBy, getDocs, getDoc, doc,
} from 'firebase/firestore';
import { db, callFunction } from './api';
import { LiveQueue, QueueItem } from '../types';

function getTodayString(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export const queueApi = {
  getLiveQueue: async (date?: string): Promise<LiveQueue> => {
    const targetDate = date || getTodayString();

    // 1. Fetch active appointments
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', targetDate),
      where('status', 'in', ['BOOKED', 'IN_SERVICE']),
      orderBy('queuePosition', 'asc'),
    );
    const snap = await getDocs(q);

    // 2. Batch-fetch user data
    const userIds = [...new Set(snap.docs.map((d) => d.data().userId))];
    const userMap: Record<string, any> = {};
    for (const uid of userIds) {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) userMap[uid] = { id: uid, ...userDoc.data() };
    }

    // 3. Get schedule for slot duration
    const scheduleDoc = await getDoc(doc(db, 'schedules', targetDate));
    const slotDuration = scheduleDoc.exists() ? scheduleDoc.data()?.slotDurationMins ?? 30 : 30;

    // 4. Build queue
    let currentlyServing: LiveQueue['currentlyServing'] = null;
    const queueItems: QueueItem[] = [];
    let position = 0;

    for (const d of snap.docs) {
      const data = d.data();
      const user = userMap[data.userId];
      const name = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
      const phoneNumber = user?.phoneNumber ?? '';

      if (data.status === 'IN_SERVICE') {
        currentlyServing = { id: d.id, name, timeSlot: data.timeSlot, phoneNumber };
      } else {
        position++;
        queueItems.push({
          id: d.id,
          position,
          name,
          userId: data.userId,
          phoneNumber,
          timeSlot: data.timeSlot,
          status: data.status,
          slotDurationMins: slotDuration,
          estimatedWaitMins: position * slotDuration,
        });
      }
    }

    return {
      date: targetDate,
      currentlyServing,
      queue: queueItems,
      totalInQueue: queueItems.length,
    };
  },

  reorder: async (date: string, orderedIds: string[]): Promise<void> => {
    await callFunction('reorderQueue', { date, orderedIds });
  },
};
