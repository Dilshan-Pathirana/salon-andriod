import {
  collection, query, where, orderBy, getDocs, getDoc, doc,
} from 'firebase/firestore';
import { db, callFunction, tsToString } from './api';
import { Service } from '../types';

function mapService(id: string, d: Record<string, any>): Service {
  return {
    id,
    name: d.name,
    description: d.description ?? null,
    duration: d.duration,
    price: d.price,
    category: d.category,
    isActive: d.isActive,
    sortOrder: d.sortOrder ?? 0,
    createdAt: tsToString(d.createdAt),
    updatedAt: tsToString(d.updatedAt),
  };
}

export const servicesApi = {
  getAll: async (includeInactive = false): Promise<Service[]> => {
    let q;
    if (includeInactive) {
      q = query(collection(db, 'services'), orderBy('sortOrder', 'asc'));
    } else {
      q = query(collection(db, 'services'), where('isActive', '==', true), orderBy('sortOrder', 'asc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapService(d.id, d.data()));
  },

  getByCategory: async (category: string): Promise<Service[]> => {
    const q = query(
      collection(db, 'services'),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapService(d.id, d.data()));
  },

  getById: async (id: string): Promise<Service> => {
    const snap = await getDoc(doc(db, 'services', id));
    if (!snap.exists()) throw new Error('Service not found');
    return mapService(id, snap.data());
  },

  create: async (data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    category: string;
    sortOrder?: number;
  }): Promise<Service> => {
    return callFunction<Service>('adminManageService', { action: 'create', ...data });
  },

  update: async (id: string, data: Partial<{
    name: string;
    description: string | null;
    duration: number;
    price: number;
    category: string;
    isActive: boolean;
    sortOrder: number;
  }>): Promise<Service> => {
    return callFunction<Service>('adminManageService', { action: 'update', serviceId: id, ...data });
  },

  delete: async (id: string): Promise<void> => {
    await callFunction('adminManageService', { action: 'delete', serviceId: id });
  },
};
