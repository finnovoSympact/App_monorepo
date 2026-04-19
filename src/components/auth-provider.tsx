"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "sme" | "bank" | "individual";

export interface MockUser {
  name: string;
  email: string;
  role: UserRole;
}

const KEY = "sanad_mock_user";

interface AuthCtx {
  user: MockUser | null;
  ready: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  ready: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setUser(JSON.parse(stored) as MockUser);
    } catch {}
    setReady(true);
  }, []);

  const login = useCallback((email: string, role: UserRole, name?: string) => {
    const u: MockUser = { email, role, name: name ?? email.split("@")[0] };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
