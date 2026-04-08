import { cache } from "react";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type SiteSettingsRow = {
  id: string;
  site_title: string;
  site_tagline: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_site: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  updated_at: string;
};

const DEFAULTS: Omit<SiteSettingsRow, "updated_at"> = {
  id: "default",
  site_title: "Curator Market",
  site_tagline: null,
  meta_description:
    "High-end SMM services and elite digital accounts. Verified growth, instant delivery, and boutique quality.",
  meta_keywords: null,
  og_title: null,
  og_description: null,
  og_image_url: null,
  twitter_site: null,
  logo_url: null,
  favicon_url: null,
};

export function mergeSiteSettings(row: Partial<SiteSettingsRow> | null): SiteSettingsRow {
  if (!row) {
    return { ...DEFAULTS, updated_at: new Date().toISOString() };
  }
  return {
    ...DEFAULTS,
    ...row,
    site_title: row.site_title?.trim() || DEFAULTS.site_title,
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

/** Server-only: reads via service role (works without RLS anon). */
export const getSiteSettingsServer = cache(async function getSiteSettingsServer(): Promise<SiteSettingsRow> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return mergeSiteSettings(null);
  }
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    return mergeSiteSettings(null);
  }
  return mergeSiteSettings(data as SiteSettingsRow);
});
