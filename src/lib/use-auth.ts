"use client";

import { useState, useEffect, useCallback } from "react";

export type UserRole = "sme" | "bank" | "individual";

export interface MockUser {
  name: string;
  email: string;
  role: UserRole;
}

export function roleRedirect(role: UserRole): string {
  if (role === "bank") return "/bank";
  if (role === "individual") return "/chat";
  return "/dashboard";
}

const KEY = "sanad_mock_user";

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setUser(JSON.parse(stored) as MockUser);
    } catch {
      /* ignore */
    }
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

  return { user, ready, login, logout };
}
