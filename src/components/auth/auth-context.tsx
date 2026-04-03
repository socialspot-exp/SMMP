"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/auth-session";
import { loadAuthUser, saveAuthUser } from "@/lib/auth-session";

type AuthContextValue = {
  user: AuthUser | null;
  /** True after reading localStorage (avoid flash of logged-out UI). */
  ready: boolean;
  signIn: (payload: { email: string; name?: string }) => void;
  signUp: (payload: { email: string; name: string }) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(loadAuthUser());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveAuthUser(user);
  }, [user, ready]);

  const signIn = useCallback((payload: { email: string; name?: string }) => {
    setUser({
      email: payload.email.trim(),
      name: payload.name?.trim() || undefined,
    });
  }, []);

  const signUp = useCallback((payload: { email: string; name: string }) => {
    setUser({
      email: payload.email.trim(),
      name: payload.name.trim(),
    });
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut }),
    [user, ready, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
