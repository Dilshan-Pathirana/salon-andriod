import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearStoredSession, getStoredSession, SessionState } from '../lib/api';

type AuthContextValue = {
  session: SessionState | null;
  loading: boolean;
  setSession: (s: SessionState | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  setSession: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredSession()
      .then((s) => setSessionState(s))
      .finally(() => setLoading(false));
  }, []);

  function setSession(s: SessionState | null) {
    setSessionState(s);
  }

  async function logout() {
    await clearStoredSession();
    setSessionState(null);
  }

  return (
    <AuthContext.Provider value={{ session, loading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
