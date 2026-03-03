import app from '../src/app';
import { connectDatabase } from '../src/config/db';

declare global {
  var __salonDbReadyPromise: Promise<void> | undefined;
}

if (!global.__salonDbReadyPromise) {
  global.__salonDbReadyPromise = connectDatabase();
}

export default async function handler(req: any, res: any): Promise<void> {
  await global.__salonDbReadyPromise;
  app(req, res);
}
