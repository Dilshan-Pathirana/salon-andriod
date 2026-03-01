/**
 * Simplified storage utilities for Firebase.
 *
 * Firebase Auth handles token storage internally via AsyncStorage.
 * These helpers are kept for backward-compatibility so any remaining
 * imports don't break, but they are mostly no-ops now.
 */
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  USER_DATA: 'salon_user_data',
} as const;

// ── Token helpers (no-ops — Firebase Auth manages tokens) ──

export async function getAccessToken(): Promise<string | null> {
  return null;
}

export async function setAccessToken(_token: string): Promise<void> {}

export async function getRefreshToken(): Promise<string | null> {
  return null;
}

export async function setRefreshToken(_token: string): Promise<void> {}

export async function setTokens(_accessToken: string, _refreshToken: string): Promise<void> {}

export async function clearTokens(): Promise<void> {
  try { await SecureStore.deleteItemAsync(KEYS.USER_DATA); } catch {}
}

// ── User data cache (optional) ──

export async function getUserData(): Promise<string | null> {
  try { return SecureStore.getItemAsync(KEYS.USER_DATA); } catch { return null; }
}

export async function setUserData(data: string): Promise<void> {
  try { await SecureStore.setItemAsync(KEYS.USER_DATA, data); } catch {}
}
