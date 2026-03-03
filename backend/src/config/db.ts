import mongoose from 'mongoose';
import { env } from './env';

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<void> {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongodbUri);
  }

  await connectionPromise;
  console.log('✅ MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  connectionPromise = null;
  await mongoose.disconnect();
  console.log('✅ MongoDB disconnected');
}
