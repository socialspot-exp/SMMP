import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mergeSiteSettings, type SiteSettingsRow } from "@/lib/site-settings";

/** Public read for storefront (anon + RLS select). */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ settings: mergeSiteSettings(null) });
  }

  const supabase = createClient(url, anon);
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();

  if (error) {
    return NextResponse.json({ settings: mergeSiteSettings(null) });
  }

  return NextResponse.json({ settings: mergeSiteSettings(data as Partial<SiteSettingsRow> | null) });
}
