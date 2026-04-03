import { NextResponse } from "next/server";
import {
  PREMIUM_CATALOG_ICON_OPTIONS,
  type PremiumCatalogIconKey,
  isPremiumCatalogIconKey,
} from "@/lib/premium-catalog-icons";
import { requireAdminApi } from "@/lib/require-admin-api";
import { slugifyPremiumLabel } from "@/lib/premium-catalog-api";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const slugRe = /^[a-z0-9][a-z0-9-]{0,62}$/;

function assertIconKey(v: string): v is PremiumCatalogIconKey {
  return isPremiumCatalogIconKey(v);
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body: { label?: string; slug?: string; icon_key?: string; sort_order?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  const iconRaw = typeof body.icon_key === "string" ? body.icon_key.trim() : "";
  if (!iconRaw || !assertIconKey(iconRaw)) {
    return NextResponse.json(
      {
        error: `icon_key must be one of: ${PREMIUM_CATALOG_ICON_OPTIONS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim().toLowerCase()
      : slugifyPremiumLabel(label);

  if (!slugRe.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const sort_order = typeof body.sort_order === "number" && Number.isFinite(body.sort_order) ? body.sort_order : 0;

  const { data, error } = await supabase
    .from("premium_catalog_categories")
    .insert({
      slug,
      label,
      icon_key: iconRaw,
      sort_order,
      is_active: true,
    })
    .select("id, slug, label, icon_key, sort_order, is_active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ category: { ...data, subcategories: [] } });
}

export async function DELETE(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query required" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { error } = await supabase.from("premium_catalog_categories").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body: {
    id?: string;
    label?: string;
    icon_key?: string;
    sort_order?: number;
    is_active?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.label === "string" && body.label.trim()) patch.label = body.label.trim();
  if (typeof body.icon_key === "string" && body.icon_key.trim()) {
    const k = body.icon_key.trim();
    if (!assertIconKey(k)) {
      return NextResponse.json({ error: "Invalid icon_key" }, { status: 400 });
    }
    patch.icon_key = k;
  }
  if (typeof body.sort_order === "number" && Number.isFinite(body.sort_order)) {
    patch.sort_order = body.sort_order;
  }
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("premium_catalog_categories")
    .update(patch)
    .eq("id", id)
    .select("id, slug, label, icon_key, sort_order, is_active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ category: data });
}
