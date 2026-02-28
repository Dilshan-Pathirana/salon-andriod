import { create } from 'zustand';
import { LiveQueue, QueueItem } from '../types';
import { queueApi } from '../services';

interface QueueState {
  liveQueue: LiveQueue | null;
  isLoading: boolean;
  error: string | null;

  fetchQueue: (date?: string) => Promise<void>;
  reorderQueue: (date: string, orderedIds: string[]) => Promise<void>;
  setQueue: (queue: LiveQueue) => void;
  clear: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  liveQueue: null,
  isLoading: false,
  error: null,

  fetchQueue: async (date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const queue = await queueApi.getLiveQueue(date);
      set({ liveQueue: queue, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load queue';
      set({ error: message, isLoading: false });
    }
  },

  reorderQueue: async (date: string, orderedIds: string[]) => {
    try {
      await queueApi.reorder(date, orderedIds);
      // Refetch after reorder
      const queue = await queueApi.getLiveQueue(date);
      set({ liveQueue: queue });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reorder queue';
      set({ error: message });
      throw error;
    }
  },

  setQueue: (queue: LiveQueue) => {
    set({ liveQueue: queue });
  },

  clear: () => {
    set({ liveQueue: null, error: null });
  },
}));
