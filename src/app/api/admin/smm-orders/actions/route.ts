import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApi } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("refresh_status"),
    orderId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("change_status"),
    orderId: z.string().uuid(),
    status: z.string().min(1).max(64),
  }),
  z.object({
    action: z.literal("cancel_refund"),
    orderId: z.string().uuid(),
  }),
]);

const FETCH_MS = 25_000;

function normalizePanelStatus(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  if (/complete/i.test(s)) return "Completed";
  if (/cancel|cancell/i.test(s)) return "Cancelled";
  if (/partial/i.test(s)) return "Partial";
  if (/progress|process|pending|queue/i.test(s)) return "Processing";
  return s;
}

async function fetchPanelStatus(panelUrl: string, panelKey: string, apiOrderId: string) {
  const params = new URLSearchParams();
  params.set("key", panelKey.trim());
  params.set("action", "status");
  params.set("order", apiOrderId.trim());

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_MS);
  try {
    const res = await fetch(panelUrl.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json, text/plain, */*",
      },
      body: params.toString(),
      signal: ac.signal,
      cache: "no-store",
    });
    const text = await res.text();
    let payload: unknown = text;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      /* keep raw */
    }
    return { ok: res.ok, status: res.status, payload };
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

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

  const { data: order, error: orderErr } = await supabase
    .from("smm_orders")
    .select("id, user_id, order_ref, price, status, api_order_id, panel_api_id, api_status_payload")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const currStatus = String(order.status ?? "");
  const isRefunded = /refund/i.test(currStatus);

  if (parsed.data.action === "change_status") {
    if (isRefunded) {
      return NextResponse.json(
        { error: "Refunded order is locked and cannot be changed" },
        { status: 400 }
      );
    }
    const next = parsed.data.status.trim();
    if (!next) return NextResponse.json({ error: "Status is required" }, { status: 400 });
    const { error } = await supabase
      .from("smm_orders")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: next });
  }

  if (parsed.data.action === "cancel_refund") {
    if (isRefunded) return NextResponse.json({ error: "Order already refunded" }, { status: 400 });

    const refundAmount = Number(order.price ?? 0);
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, wallet_balance")
      .eq("id", String(order.user_id))
      .maybeSingle();
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
    if (!profile) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    const before = profile.wallet_balance != null ? Number(profile.wallet_balance) : 0;
    const after = before + refundAmount;

    const { error: balErr } = await supabase
      .from("profiles")
      .update({ wallet_balance: after })
      .eq("id", String(order.user_id));
    if (balErr) return NextResponse.json({ error: balErr.message }, { status: 500 });

    const reason = `Refund for SMM order ${String(order.order_ref)}`;
    const { error: txnErr } = await supabase.from("wallet_transactions").insert({
      user_id: String(order.user_id),
      type: "credit",
      amount: refundAmount,
      reason,
      meta: { kind: "smm_order_refund", orderId: String(order.id), orderRef: String(order.order_ref) },
    });
    if (txnErr) return NextResponse.json({ error: txnErr.message }, { status: 500 });

    const existingPayload =
      order.api_status_payload && typeof order.api_status_payload === "object"
        ? (order.api_status_payload as Record<string, unknown>)
        : {};
    const { error: updErr } = await supabase
      .from("smm_orders")
      .update({
        status: "Refunded",
        api_status_payload: {
          ...existingPayload,
          refund: { amount: refundAmount, at: new Date().toISOString() },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, status: "Refunded", refundedAmount: refundAmount });
  }

  if (isRefunded) {
    return NextResponse.json(
      { error: "Refunded order is locked and cannot be refreshed" },
      { status: 400 }
    );
  }

  if (!order.api_order_id || !String(order.api_order_id).trim()) {
    return NextResponse.json({ error: "API order id not set for this order yet" }, { status: 400 });
  }
  if (!order.panel_api_id) {
    return NextResponse.json({ error: "Panel API not linked for this order" }, { status: 400 });
  }

  const { data: panel, error: panelErr } = await supabase
    .from("smm_panel_apis")
    .select("id, api_url, api_key, is_active")
    .eq("id", String(order.panel_api_id))
    .maybeSingle();
  if (panelErr) return NextResponse.json({ error: panelErr.message }, { status: 500 });
  if (!panel?.api_url || !panel.api_key) return NextResponse.json({ error: "Panel not configured" }, { status: 404 });
  if (panel.is_active === false) return NextResponse.json({ error: "Panel is disabled" }, { status: 400 });

  const out = await fetchPanelStatus(String(panel.api_url), String(panel.api_key), String(order.api_order_id));
  const obj = out.payload && typeof out.payload === "object" ? (out.payload as Record<string, unknown>) : {};
  if (!out.ok) {
    return NextResponse.json(
      { error: `Panel HTTP ${out.status}`, panelResponse: obj },
      { status: 502 }
    );
  }
  const nextStatus =
    normalizePanelStatus(obj.status) ??
    normalizePanelStatus(obj.state) ??
    normalizePanelStatus(obj.order_status) ??
    currStatus;

  const { error: updErr } = await supabase
    .from("smm_orders")
    .update({
      status: nextStatus,
      api_status_payload: obj,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: nextStatus, apiStatusPayload: obj });
}

