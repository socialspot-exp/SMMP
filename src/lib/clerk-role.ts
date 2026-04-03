/**
 * Admins (any match):
 * 1) `APP_ADMIN_EMAILS` — comma-separated emails (server env, case-insensitive).
 * 2) Clerk public metadata: `{ "role": "admin" }` or `{ "isAdmin": true }`
 *
 * Client components cannot read `APP_ADMIN_EMAILS`. For the same allowlist in the
 * browser (e.g. UserButton menu), set `NEXT_PUBLIC_APP_ADMIN_EMAILS` to the same list.
 */
type UserLike = {
  publicMetadata?: Record<string, unknown>;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }>;
};

function adminEmailsFromServerEnv(): string[] {
  return (process.env.APP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function adminEmailsFromPublicEnv(): string[] {
  return (process.env.NEXT_PUBLIC_APP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAppAdminFromMetadata(user: UserLike | null | undefined): boolean {
  if (!user) return false;
  const m = user.publicMetadata;
  if (m && typeof m === "object") {
    if (m.role === "admin") return true;
    if (m.isAdmin === true) return true;
  }
  return false;
}

function clerkUserEmailsLower(user: UserLike): string[] {
  const out = new Set<string>();
  const primary = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (primary) out.add(primary);
  for (const row of user.emailAddresses ?? []) {
    const a = row.emailAddress?.trim().toLowerCase();
    if (a) out.add(a);
  }
  return [...out];
}

/** Server / API routes — uses `APP_ADMIN_EMAILS`. */
export function isAppAdminUser(user: UserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAppAdminFromMetadata(user)) return true;

  const allow = adminEmailsFromServerEnv();
  if (allow.length > 0) {
    const emails = clerkUserEmailsLower(user);
    if (emails.some((e) => allow.includes(e))) return true;
  }

  return false;
}

/** Client — metadata + optional `NEXT_PUBLIC_APP_ADMIN_EMAILS` (mirror of server list). */
export function isAppAdminClientUser(user: UserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAppAdminFromMetadata(user)) return true;

  const allow = adminEmailsFromPublicEnv();
  if (allow.length > 0) {
    const emails = clerkUserEmailsLower(user);
    if (emails.some((e) => allow.includes(e))) return true;
  }

  return false;
}
