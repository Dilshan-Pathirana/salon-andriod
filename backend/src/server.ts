import http from 'http';
import app from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { seedInitialData } from './seed/seed';

const server = http.createServer(app);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    await seedInitialData();

    server.listen(env.port, () => {
      console.log(`✅ Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server', error);
    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  await disconnectDatabase();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

void startServer();
