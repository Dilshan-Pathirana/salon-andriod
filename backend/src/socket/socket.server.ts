import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

let io: SocketServer | null = null;

export function initializeSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId}, Role: ${socket.data.role})`);

    // Join a room for the user
    socket.join(`user:${socket.data.userId}`);

    // Join role-based rooms
    socket.join(`role:${socket.data.role}`);

    // Join a date-specific room for queue updates
    socket.on('join_queue', (date: string) => {
      socket.join(`queue:${date}`);
      console.log(`Socket ${socket.id} joined queue room for ${date}`);
    });

    socket.on('leave_queue', (date: string) => {
      socket.leave(`queue:${date}`);
      console.log(`Socket ${socket.id} left queue room for ${date}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} - ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error: ${socket.id}`, error);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
}

export function getSocketIO(): SocketServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitQueueUpdate(date: string): void {
  if (io) {
    io.emit('queue_updated', { date });
  }
}

export function emitAppointmentCompleted(appointmentId: string, date: string): void {
  if (io) {
    io.emit('appointment_completed', { appointmentId, date });
  }
}

export function emitSessionClosed(date: string): void {
  if (io) {
    io.emit('session_closed', { date });
  }
}
