import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { mergeSiteSettings, type SiteSettingsRow } from "@/lib/site-settings";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: mergeSiteSettings(data as Partial<SiteSettingsRow> | null) });
}

export async function PATCH(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = (await req.json()) as Partial<Record<keyof SiteSettingsRow, string | null>>;

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const keys: (keyof SiteSettingsRow)[] = [
    "site_title",
    "site_tagline",
    "meta_description",
    "meta_keywords",
    "og_title",
    "og_description",
    "og_image_url",
    "twitter_site",
    "logo_url",
    "favicon_url",
  ];

  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      const v = body[k];
      patch[k] = typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;
    }
  }

  const { data, error } = await supabase
    .from("site_settings")
    .update(patch)
    .eq("id", "default")
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: mergeSiteSettings(data as Partial<SiteSettingsRow>) });
}
