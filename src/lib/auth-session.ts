export type AuthUser = {
  email: string;
  /** Display name when available (e.g. from signup). */
  name?: string;
};

const STORAGE_KEY = "curator-auth-session-v1";

export function loadAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (typeof o.email !== "string" || !o.email.trim()) return null;
    return {
      email: o.email.trim(),
      name: typeof o.name === "string" && o.name.trim() ? o.name.trim() : undefined,
    };
  } catch {
    return null;
  }
}

export function saveAuthUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
