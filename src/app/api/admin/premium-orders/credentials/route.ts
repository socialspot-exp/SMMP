import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApi } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

const credentialsSchema = z.record(z.string(), z.string().max(8000)).default({});

const itemsSchema = z
  .array(
    z.object({
      key: z.string().max(200),
      value: z.string().max(8000),
    })
  )
  .default([]);

const bodySchema = z.object({
  orderId: z.string().uuid(),
  // legacy support (object map)
  credentials: credentialsSchema.optional(),
  // preferred (ordered)
  credentialsItems: itemsSchema.optional(),
});

function sanitizeCredentials(input: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    const key = k.trim();
    const val = v.trim();
    if (!key) continue;
    if (!val) continue; // keep credential payload clean; empty values are usually mistakes
    out[key] = val;
  }
  return out;
}

function sanitizeItems(input: Array<{ key: string; value: string }>) {
  const out: Array<{ key: string; value: string }> = [];
  for (const it of input) {
    const key = it.key.trim();
    const value = it.value.trim();
    if (!key || !value) continue;
    out.push({ key, value });
  }
  return out;
}

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const adminAuth = await auth();
  const adminUserId = adminAuth.userId ?? null;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { orderId } = parsed.data;
  const items = sanitizeItems(parsed.data.credentialsItems ?? []);
  const credentialsObj =
    parsed.data.credentials && typeof parsed.data.credentials === "object"
      ? sanitizeCredentials(parsed.data.credentials)
      : {};

  // If only ordered items are provided, also derive the object map for convenience/search.
  const derivedObj =
    items.length > 0
      ? items.reduce((acc: Record<string, string>, it) => {
          acc[it.key] = it.value;
          return acc;
        }, {})
      : {};

  const sanitized = Object.keys(credentialsObj).length > 0 ? credentialsObj : derivedObj;

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  // Load the order so we can notify the correct user.
  const { data: order, error: orderErr } = await supabase
    .from("premium_orders")
    .select("id, order_ref, user_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const nowIso = new Date().toISOString();

  // Upsert credential payload (edit == update row).
  const { error: credErr } = await supabase.from("premium_order_credentials").upsert(
    {
      order_id: orderId,
      credentials: sanitized,
      credentials_items: items,
      provided_by_id: adminUserId,
      provided_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "order_id" }
  );

  if (credErr) {
    return NextResponse.json({ error: credErr.message }, { status: 500 });
  }

  // Update order credentials state + timestamp.
  const { error: orderUpdErr } = await supabase
    .from("premium_orders")
    .update({
      credentials_state: "sent",
      credentials_provided_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", orderId);

  if (orderUpdErr) {
    return NextResponse.json({ error: orderUpdErr.message }, { status: 500 });
  }

  // Trigger per-order notification for the user.
  const { error: notifErr } = await supabase.from("premium_order_notifications").insert({
    order_id: orderId,
    user_id: order.user_id,
    type: "credentials_provided",
    title: "Credentials ready",
    message: `Your premium account credentials for ${order.order_ref} are ready.`,
  });

  if (notifErr) {
    // Don't block the credential save if notification insertion fails.
    console.error("premium_order_notifications insert failed:", notifErr);
  }

  return NextResponse.json({ success: true });
}

