import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, callFunction, tsToString } from './api';
import { AuthResponse, User } from '../types';

function phoneToEmail(phone: string): string {
  return `${phone}@salon.app`;
}

export const authApi = {
  login: async (phoneNumber: string, password: string): Promise<AuthResponse> => {
    const email = phoneToEmail(phoneNumber);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) throw new Error('User profile not found');
    const d = userDoc.data();

    const user: User = {
      id: uid,
      phoneNumber: d.phoneNumber,
      firstName: d.firstName,
      lastName: d.lastName,
      role: d.role,
      profileImageUrl: d.profileImageUrl ?? null,
      isActive: d.isActive,
      createdAt: tsToString(d.createdAt),
    };

    return {
      user,
      accessToken: await credential.user.getIdToken(),
      refreshToken: credential.user.refreshToken,
    };
  },

  register: async (data: {
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<AuthResponse> => {
    await callFunction('registerUser', data);
    return authApi.login(data.phoneNumber, data.password);
  },

  refreshToken: async (_refreshToken: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const accessToken = await user.getIdToken(true);
    return { accessToken, refreshToken: user.refreshToken };
  },

  logout: async (_refreshToken?: string): Promise<void> => {
    await signOut(auth);
  },
};
