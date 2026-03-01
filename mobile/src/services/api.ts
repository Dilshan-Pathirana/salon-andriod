/**
 * Firebase API helpers — replaces the old Axios-based HTTP client.
 *
 * • Reads come directly from Firestore via the JS SDK.
 * • Writes go through Cloud Functions (httpsCallable).
 * • Firebase Auth handles token lifecycle automatically.
 */
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { Timestamp } from 'firebase/firestore';
import { db, auth, functions } from '../config/firebase';

/** Call a Cloud Function by name and return the unwrapped result. */
export async function callFunction<T = any>(name: string, data?: Record<string, any>): Promise<T> {
  const fn = httpsCallable(functions, name);
  const result: HttpsCallableResult = await fn(data || {});
  return result.data as T;
}

/** Convert a Firestore Timestamp (or Timestamp-like object) to an ISO string. Returns empty string for null/undefined. */
export function tsToString(ts: Timestamp | { seconds: number; nanoseconds: number } | string | null | undefined): string {
  if (!ts) return '';
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'object' && 'seconds' in ts) return new Date(ts.seconds * 1000).toISOString();
  if (typeof ts === 'string') return ts;
  return '';
}

export { db, auth, functions };
