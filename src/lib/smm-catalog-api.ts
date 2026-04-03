import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type SmmPlatformDTO = {
  id: string;
  slug: string;
  label: string;
  icon_key: string;
  sort_order: number;
  is_active: boolean;
  subcategories: SmmSubcategoryDTO[];
};

export type SmmSubcategoryDTO = {
  id: string;
  platform_id: string;
  slug: string;
  label: string;
  sort_order: number;
  is_active: boolean;
};

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Public: active platforms + active subcategories (respects RLS). */
export async function fetchSmmCatalogPublic(): Promise<{
  ok: true;
  platforms: SmmPlatformDTO[];
} | { ok: false; error: string }> {
  const supabase = createAnonClient();
  if (!supabase) {
    return { ok: false, error: "Supabase not configured" };
  }

  const { data: platforms, error: pErr } = await supabase
    .from("smm_platforms")
    .select("id, slug, label, icon_key, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (pErr) return { ok: false, error: pErr.message };

  const { data: subs, error: sErr } = await supabase
    .from("smm_subcategories")
    .select("id, platform_id, slug, label, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (sErr) return { ok: false, error: sErr.message };

  const subRows = subs ?? [];
  const tree: SmmPlatformDTO[] = (platforms ?? []).map((p) => ({
    ...p,
    subcategories: subRows.filter((s) => s.platform_id === p.id),
  }));

  return { ok: true, platforms: tree };
}

/** Admin: all platforms and subcategories (service role). */
export async function fetchSmmCatalogAdmin(): Promise<{
  ok: true;
  platforms: SmmPlatformDTO[];
} | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase service role not configured" };
  }

  const { data: platforms, error: pErr } = await supabase
    .from("smm_platforms")
    .select("id, slug, label, icon_key, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (pErr) return { ok: false, error: pErr.message };

  const { data: subs, error: sErr } = await supabase
    .from("smm_subcategories")
    .select("id, platform_id, slug, label, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (sErr) return { ok: false, error: sErr.message };

  const subRows = subs ?? [];
  const tree: SmmPlatformDTO[] = (platforms ?? []).map((p) => ({
    ...p,
    subcategories: subRows.filter((s) => s.platform_id === p.id),
  }));

  return { ok: true, platforms: tree };
}

export function slugifyLabel(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 62);
  return s.length > 0 ? s : "item";
}
