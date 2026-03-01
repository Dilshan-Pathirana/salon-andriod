/**
 * Firebase configuration for Expo / React Native.
 *
 * Uses the Firebase JS SDK (NOT @react-native-firebase) so it works inside
 * Expo Go without native modules.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore – getReactNativePersistence exists at runtime in RN bundles
import { getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA_C5JU8Rqb0PHr37QbmP0ZH5fSpBb8tys',
  authDomain: 'salon-app-54d7b.firebaseapp.com',
  projectId: 'salon-app-54d7b',
  storageBucket: 'salon-app-54d7b.firebasestorage.app',
  messagingSenderId: '838890672878',
  appId: '1:838890672878:web:c765e79bc440850357d9ff',
  measurementId: 'G-F6NM71V2CH',
};

// Avoid re-initialising on Expo Fast Refresh
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth with AsyncStorage persistence (survives app restarts)
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // initializeAuth throws if called twice (Fast Refresh) — fall back
  auth = getAuth(app);
}

const db = getFirestore(app);
const functions = getFunctions(app);

if (__DEV__) {
  const LOCAL_IP = '192.168.8.184';
  connectAuthEmulator(auth, `http://${LOCAL_IP}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, LOCAL_IP, 8080);
  connectFunctionsEmulator(functions, LOCAL_IP, 5001);
}

export { app, auth, db, functions };