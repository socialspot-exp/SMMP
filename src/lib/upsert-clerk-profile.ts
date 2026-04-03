import type { User, UserJSON } from "@clerk/backend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  usernameBaseFromClerkHandle,
  usernameBaseFromEmail,
} from "@/lib/username-from-email";

export function primaryEmailFromUserJson(user: UserJSON): string | null {
  if (user.primary_email_address_id) {
    const match = user.email_addresses?.find(
      (e) => e.id === user.primary_email_address_id
    );
    if (match?.email_address) return match.email_address;
  }
  return user.email_addresses?.[0]?.email_address ?? null;
}

export type UpsertClerkProfileResult =
  | { ok: true }
  | { ok: false; reason: "no_admin" | "db_error"; message: string };

function usernameCandidateForUpsert(
  email: string | null,
  clerkUsername: string | null | undefined
): string {
  if (email?.trim()) {
    return usernameBaseFromEmail(email);
  }
  return usernameBaseFromClerkHandle(clerkUsername ?? null);
}

/** Pick a stored `username` unique across other profiles (same clerk `id` wins). */
async function resolveUniqueUsername(
  supabase: SupabaseClient,
  base: string,
  selfClerkId: string
): Promise<string> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate =
      attempt === 0
        ? base.slice(0, 30)
        : (() => {
            const suffix = `_${attempt + 1}`;
            const maxBase = Math.max(1, 30 - suffix.length);
            return `${base.slice(0, maxBase)}${suffix}`;
          })();

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!data || data.id === selfClerkId) {
      return candidate;
    }
  }

  const tail = selfClerkId.replace(/[^a-z0-9]/gi, "").slice(-8) || "user";
  return `${base.slice(0, 20)}_${tail}`.slice(0, 30);
}

async function upsertProfileRow(input: {
  id: string;
  email: string | null;
  full_name: string | null;
  clerkUsername: string | null | undefined;
  image_url: string | null;
  primary_email_verified: boolean;
}): Promise<UpsertClerkProfileResult> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, reason: "no_admin", message: "SUPABASE_SERVICE_ROLE_KEY not set" };
  }

  const base = usernameCandidateForUpsert(input.email, input.clerkUsername);
  const username = await resolveUniqueUsername(supabase, base, input.id);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.id,
      email: input.email,
      full_name: input.full_name,
      username,
      image_url: input.image_url,
      primary_email_verified: input.primary_email_verified,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, reason: "db_error", message: error.message };
  }
  return { ok: true };
}

/** Webhook payloads use `UserJSON`. */
export async function upsertProfileFromClerkUser(user: UserJSON): Promise<UpsertClerkProfileResult> {
  const email = primaryEmailFromUserJson(user);
  const primary = user.primary_email_address_id
    ? user.email_addresses?.find((e) => e.id === user.primary_email_address_id)
    : null;
  const emailVerified = primary?.verification?.status === "verified";

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    null;

  return upsertProfileRow({
    id: user.id,
    email,
    full_name: fullName,
    clerkUsername: user.username,
    image_url: user.image_url || null,
    primary_email_verified: emailVerified,
  });
}

/** `currentUser()` returns Backend `User` (may expose `.raw` as `UserJSON`). */
export async function upsertProfileFromClerkBackendUser(user: User): Promise<UpsertClerkProfileResult> {
  const raw = user.raw;
  if (raw) return upsertProfileFromClerkUser(raw);

  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username || null;

  return upsertProfileRow({
    id: user.id,
    email,
    full_name: fullName,
    clerkUsername: user.username,
    image_url: user.imageUrl || null,
    primary_email_verified: emailVerified,
  });
}

export async function deleteProfileByClerkId(clerkUserId: string): Promise<UpsertClerkProfileResult> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, reason: "no_admin", message: "SUPABASE_SERVICE_ROLE_KEY not set" };
  }
  const { error } = await supabase.from("profiles").delete().eq("id", clerkUserId);
  if (error) {
    return { ok: false, reason: "db_error", message: error.message };
  }
  return { ok: true };
}
