import app from '../src/app';
import { connectDatabase } from '../src/config/db';

declare global {
  var __salonDbReadyPromise: Promise<void> | undefined;
}

async function ensureDatabaseConnection(): Promise<void> {
  if (!global.__salonDbReadyPromise) {
    global.__salonDbReadyPromise = connectDatabase().catch((error) => {
      global.__salonDbReadyPromise = undefined;
      throw error;
    });
  }

  await global.__salonDbReadyPromise;
}

export default async function handler(req: any, res: any): Promise<void> {
  try {
    await ensureDatabaseConnection();
    app(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Function invocation failed';
    const isHealthEndpoint = String(req?.url ?? '').includes('/api/health');

    res.status(isHealthEndpoint ? 503 : 500).json({
      success: false,
      message: isHealthEndpoint ? 'API unhealthy: database connection failed' : 'Function invocation failed',
      error: message,
    });
  }
}
