import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  id: z.string().uuid(),
});

const FETCH_MS = 20_000;

/**
 * Perfect Panel–style balance check: POST form body key + action=balance to the panel API URL.
 * @see https://demo.perfectpanel.com/panels-demo/api
 */
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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid id", details: parsed.error.flatten() }, { status: 400 });
  }

  const { data: row, error: qErr } = await supabase
    .from("smm_panel_apis")
    .select("id, label, api_url, api_key")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 400 });
  }
  if (!row?.api_url || !row.api_key) {
    return NextResponse.json({ error: "Panel not found" }, { status: 404 });
  }

  const params = new URLSearchParams();
  params.set("key", row.api_key.trim());
  params.set("action", "balance");

  let res: Response;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_MS);
  try {
    res = await fetch(row.api_url.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json, text/plain, */*",
      },
      body: params.toString(),
      signal: ac.signal,
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Request failed";
    return NextResponse.json(
      {
        ok: false,
        error: msg.includes("abort") ? "Panel request timed out" : msg,
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(t);
  }

  const text = await res.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text */
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Panel HTTP ${res.status}`,
        panelResponse: payload,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    label: row.label as string,
    panelResponse: payload,
  });
}
