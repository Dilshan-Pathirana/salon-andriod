import {
  collection, query, where, getDocs, doc, getDoc,
} from 'firebase/firestore';
import { db, callFunction, tsToString } from './api';
import { BusinessInfo } from '../types';

function mapBusinessInfo(id: string, d: Record<string, any>): BusinessInfo {
  return {
    id,
    key: id,
    value: d.value,
    category: d.category ?? 'about',
    createdAt: tsToString(d.createdAt),
    updatedAt: tsToString(d.updatedAt),
  };
}

export const businessInfoApi = {
  getAll: async (): Promise<BusinessInfo[]> => {
    const snap = await getDocs(collection(db, 'businessInfo'));
    return snap.docs.map((d) => mapBusinessInfo(d.id, d.data()));
  },

  getByCategory: async (category: string): Promise<BusinessInfo[]> => {
    const q = query(collection(db, 'businessInfo'), where('category', '==', category));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapBusinessInfo(d.id, d.data()));
  },

  upsert: async (data: { key: string; value: string; category: string }): Promise<BusinessInfo> => {
    return callFunction<BusinessInfo>('adminManageBusinessInfo', { action: 'upsert', ...data });
  },

  bulkUpsert: async (items: { key: string; value: string; category: string }[]): Promise<BusinessInfo[]> => {
    return callFunction<BusinessInfo[]>('adminManageBusinessInfo', { action: 'bulkUpsert', items });
  },

  remove: async (key: string): Promise<void> => {
    await callFunction('adminManageBusinessInfo', { action: 'remove', key });
  },
};
