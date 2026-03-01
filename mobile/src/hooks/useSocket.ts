/**
 * useSocket — Firestore real-time replacement for Socket.IO.
 *
 * Uses Firestore onSnapshot listeners to react to appointment changes,
 * keeping the same external API ({ connect, disconnect, joinQueue, leaveQueue, isConnected })
 * so existing screens don't need modification.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  collection, query, where, orderBy, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { db } from '../services/api';
import { useQueueStore } from '../store';

export function useSocket() {
  const unsubRef = useRef<Unsubscribe | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { fetchQueue } = useQueueStore();

  /** No TCP handshake needed — just flag "connected". */
  const connect = useCallback(async () => {
    setIsConnected(true);
  }, []);

  /** Tear down any active listener. */
  const disconnect = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
    setIsConnected(false);
  }, []);

  /** Subscribe to real-time appointment changes for a given date. */
  const joinQueue = useCallback(
    (date: string) => {
      // Clean up previous subscription
      unsubRef.current?.();

      const q = query(
        collection(db, 'appointments'),
        where('date', '==', date),
        where('status', 'in', ['BOOKED', 'IN_SERVICE']),
        orderBy('queuePosition', 'asc'),
      );

      unsubRef.current = onSnapshot(
        q,
        () => {
          // Snapshot changed → refresh queue via the store (which reads Firestore)
          fetchQueue(date);
        },
        (err) => {
          console.error('onSnapshot error:', err);
        },
      );
    },
    [fetchQueue],
  );

  /** Unsubscribe from the snapshot listener for a given date. */
  const leaveQueue = useCallback((_date: string) => {
    unsubRef.current?.();
    unsubRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubRef.current?.();
    };
  }, []);

  return {
    connect,
    disconnect,
    joinQueue,
    leaveQueue,
    isConnected,
  };
}
