import {
  collection, query, where, orderBy, getDocs, getDoc, doc,
} from 'firebase/firestore';
import { db, callFunction, tsToString } from './api';
import { Review, ReviewStats } from '../types';

async function mapReview(id: string, d: Record<string, any>): Promise<Review> {
  let user: Review['user'];
  if (d.userId) {
    const uDoc = await getDoc(doc(db, 'users', d.userId));
    if (uDoc.exists()) {
      const u = uDoc.data();
      user = { id: d.userId, firstName: u.firstName, lastName: u.lastName, profileImageUrl: u.profileImageUrl ?? null };
    }
  }

  let appointment: Review['appointment'];
  if (d.appointmentId) {
    const aDoc = await getDoc(doc(db, 'appointments', d.appointmentId));
    if (aDoc.exists()) {
      const a = aDoc.data();
      appointment = { id: d.appointmentId, date: a.date, timeSlot: a.timeSlot };
    }
  }

  return {
    id,
    userId: d.userId,
    appointmentId: d.appointmentId,
    rating: d.rating,
    comment: d.comment ?? null,
    isVisible: d.isVisible,
    createdAt: tsToString(d.createdAt),
    updatedAt: tsToString(d.updatedAt),
    user,
    appointment,
  };
}

export const reviewsApi = {
  getAll: async (showAll = false): Promise<Review[]> => {
    let q;
    if (showAll) {
      q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'reviews'), where('isVisible', '==', true), orderBy('createdAt', 'desc'));
    }
    const snap = await getDocs(q);
    return Promise.all(snap.docs.map((d) => mapReview(d.id, d.data())));
  },

  getStats: async (): Promise<ReviewStats> => {
    const q = query(collection(db, 'reviews'), where('isVisible', '==', true));
    const snap = await getDocs(q);

    const distribution = [1, 2, 3, 4, 5].map((r) => ({ rating: r, count: 0 }));
    let total = 0;
    let sum = 0;

    for (const d of snap.docs) {
      const rating = d.data().rating as number;
      total++;
      sum += rating;
      const entry = distribution.find((e) => e.rating === rating);
      if (entry) entry.count++;
    }

    return {
      averageRating: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
      totalReviews: total,
      distribution,
    };
  },

  create: async (data: { appointmentId: string; rating: number; comment?: string }): Promise<Review> => {
    const result = await callFunction<any>('createReview', data);
    return result as Review;
  },

  delete: async (id: string): Promise<void> => {
    await callFunction('adminManageReview', { action: 'delete', reviewId: id });
  },

  toggleVisibility: async (id: string): Promise<Review> => {
    const result = await callFunction<any>('adminManageReview', { action: 'toggleVisibility', reviewId: id });
    return result as Review;
  },
};
