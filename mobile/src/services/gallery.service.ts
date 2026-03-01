import {
  collection, query, where, orderBy, getDocs, getDoc, doc,
} from 'firebase/firestore';
import { db, callFunction, tsToString } from './api';
import { GalleryItem } from '../types';

function mapGalleryItem(id: string, d: Record<string, any>): GalleryItem {
  return {
    id,
    title: d.title,
    description: d.description ?? null,
    imageUrl: d.imageUrl,
    category: d.category ?? 'Haircut',
    sortOrder: d.sortOrder ?? 0,
    isActive: d.isActive,
    createdAt: tsToString(d.createdAt),
    updatedAt: tsToString(d.updatedAt),
  };
}

export const galleryApi = {
  getAll: async (includeInactive = false): Promise<GalleryItem[]> => {
    let q;
    if (includeInactive) {
      q = query(collection(db, 'gallery'), orderBy('sortOrder', 'asc'));
    } else {
      q = query(collection(db, 'gallery'), where('isActive', '==', true), orderBy('sortOrder', 'asc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapGalleryItem(d.id, d.data()));
  },

  getByCategory: async (category: string): Promise<GalleryItem[]> => {
    const q = query(
      collection(db, 'gallery'),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapGalleryItem(d.id, d.data()));
  },

  getById: async (id: string): Promise<GalleryItem> => {
    const snap = await getDoc(doc(db, 'gallery', id));
    if (!snap.exists()) throw new Error('Gallery item not found');
    return mapGalleryItem(id, snap.data());
  },

  create: async (data: {
    title: string;
    description?: string;
    imageUrl: string;
    category?: string;
    sortOrder?: number;
  }): Promise<GalleryItem> => {
    return callFunction<GalleryItem>('adminManageGallery', { action: 'create', ...data });
  },

  update: async (id: string, data: Partial<{
    title: string;
    description: string | null;
    imageUrl: string;
    category: string;
    isActive: boolean;
    sortOrder: number;
  }>): Promise<GalleryItem> => {
    return callFunction<GalleryItem>('adminManageGallery', { action: 'update', galleryId: id, ...data });
  },

  delete: async (id: string): Promise<void> => {
    await callFunction('adminManageGallery', { action: 'delete', galleryId: id });
  },
};
