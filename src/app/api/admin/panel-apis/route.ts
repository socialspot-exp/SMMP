import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const urlSchema = z.string().url().regex(/^https:\/\//i, "API URL must use https://");

function maskKey(key: string): string {
  const t = key.trim();
  if (t.length <= 4) return "••••";
  return `••••••••${t.slice(-4)}`;
}

export type PanelApiRow = {
  id: string;
  label: string;
  api_url: string;
  api_key: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("smm_panel_apis")
    .select("id, label, api_url, api_key, is_active, notes, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const panels = (data ?? []).map((row: PanelApiRow) => ({
    id: row.id,
    label: row.label,
    api_url: row.api_url,
    api_key_masked: maskKey(row.api_key),
    is_active: row.is_active,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return NextResponse.json({ panels });
}

const postSchema = z.object({
  label: z.string().min(1).max(200),
  api_url: urlSchema.max(2000),
  api_key: z.string().min(1).max(4000),
  notes: z.string().max(2000).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const { data, error } = await supabase
    .from("smm_panel_apis")
    .insert({
      label: body.label.trim(),
      api_url: body.api_url.trim(),
      api_key: body.api_key.trim(),
      notes: body.notes?.trim() || null,
      is_active: body.is_active,
    })
    .select("id, label, api_url, api_key, is_active, notes, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const row = data as PanelApiRow;
  return NextResponse.json({
    panel: {
      id: row.id,
      label: row.label,
      api_url: row.api_url,
      api_key_masked: maskKey(row.api_key),
      is_active: row.is_active,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(200).optional(),
  api_url: urlSchema.max(2000).optional(),
  api_key: z.string().min(1).max(4000).optional(),
  notes: z.string().max(2000).optional().nullable(),
  is_active: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (rest.label !== undefined) patch.label = rest.label.trim();
  if (rest.api_url !== undefined) patch.api_url = rest.api_url.trim();
  if (rest.api_key !== undefined && rest.api_key.trim() !== "") patch.api_key = rest.api_key.trim();
  if (rest.notes !== undefined) patch.notes = rest.notes?.trim() || null;
  if (rest.is_active !== undefined) patch.is_active = rest.is_active;

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("smm_panel_apis")
    .update(patch)
    .eq("id", id)
    .select("id, label, api_url, api_key, is_active, notes, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const row = data as PanelApiRow;
  return NextResponse.json({
    panel: {
      id: row.id,
      label: row.label,
      api_url: row.api_url,
      api_key_masked: maskKey(row.api_key),
      is_active: row.is_active,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  });
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

  const { error } = await supabase.from("smm_panel_apis").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
