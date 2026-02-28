import http from 'http';
import app from './app';
import { config, prisma } from './config';
import { initializeSocket } from './socket';

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

async function startServer(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    server.listen(config.server.port, () => {
      console.log(`✅ Server running on port ${config.server.port}`);
      console.log(`✅ Environment: ${config.server.nodeEnv}`);
      console.log(`✅ API Base URL: http://localhost:${config.server.port}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(): Promise<void> {
  console.log('\n🔄 Shutting down gracefully...');

  server.close(() => {
    console.log('✅ HTTP server closed');
  });

  await prisma.$disconnect();
  console.log('✅ Database disconnected');

  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
