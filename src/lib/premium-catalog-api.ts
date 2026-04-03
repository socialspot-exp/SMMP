import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type PremiumCatalogCategoryDTO = {
  id: string;
  slug: string;
  label: string;
  icon_key: string;
  sort_order: number;
  is_active: boolean;
  subcategories: PremiumCatalogSubcategoryDTO[];
};

export type PremiumCatalogSubcategoryDTO = {
  id: string;
  category_id: string;
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

export async function fetchPremiumCatalogPublic(): Promise<{
  ok: true;
  categories: PremiumCatalogCategoryDTO[];
} | { ok: false; error: string }> {
  const supabase = createAnonClient();
  if (!supabase) {
    return { ok: false, error: "Supabase not configured" };
  }

  const { data: categories, error: cErr } = await supabase
    .from("premium_catalog_categories")
    .select("id, slug, label, icon_key, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (cErr) return { ok: false, error: cErr.message };

  const { data: subs, error: sErr } = await supabase
    .from("premium_catalog_subcategories")
    .select("id, category_id, slug, label, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (sErr) return { ok: false, error: sErr.message };

  const subRows = subs ?? [];
  const tree: PremiumCatalogCategoryDTO[] = (categories ?? []).map((c) => ({
    ...c,
    subcategories: subRows.filter((s) => s.category_id === c.id),
  }));

  return { ok: true, categories: tree };
}

export async function fetchPremiumCatalogAdmin(): Promise<{
  ok: true;
  categories: PremiumCatalogCategoryDTO[];
} | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase service role not configured" };
  }

  const { data: categories, error: cErr } = await supabase
    .from("premium_catalog_categories")
    .select("id, slug, label, icon_key, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (cErr) return { ok: false, error: cErr.message };

  const { data: subs, error: sErr } = await supabase
    .from("premium_catalog_subcategories")
    .select("id, category_id, slug, label, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (sErr) return { ok: false, error: sErr.message };

  const subRows = subs ?? [];
  const tree: PremiumCatalogCategoryDTO[] = (categories ?? []).map((c) => ({
    ...c,
    subcategories: subRows.filter((s) => s.category_id === c.id),
  }));

  return { ok: true, categories: tree };
}

export function slugifyPremiumLabel(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 62);
  return s.length > 0 ? s : "item";
}
