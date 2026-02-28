import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import { getAccessToken } from '../utils/storage';
import { useQueueStore } from '../store';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { fetchQueue, liveQueue } = useQueueStore();

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return;

    const token = await getAccessToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('queue_updated', (data: { date: string }) => {
      console.log('Queue updated event:', data);
      fetchQueue(data.date);
    });

    socket.on('appointment_completed', (data: { appointmentId: string; date: string }) => {
      console.log('Appointment completed event:', data);
      fetchQueue(data.date);
    });

    socket.on('session_closed', (data: { date: string }) => {
      console.log('Session closed event:', data);
      fetchQueue(data.date);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socketRef.current = socket;
  }, [fetchQueue]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const joinQueue = useCallback((date: string) => {
    socketRef.current?.emit('join_queue', date);
  }, []);

  const leaveQueue = useCallback((date: string) => {
    socketRef.current?.emit('leave_queue', date);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    joinQueue,
    leaveQueue,
    isConnected: socketRef.current?.connected ?? false,
  };
}
