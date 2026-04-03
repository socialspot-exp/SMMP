import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  orderId: z.string().uuid(),
});

const FETCH_MS = 25_000;

function normalizePanelStatus(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  // common Perfect Panel statuses: Pending, In progress, Processing, Completed, Partial, Canceled
  if (/complete/i.test(s)) return "Completed";
  if (/cancel|cancell/i.test(s)) return "Cancelled";
  if (/partial/i.test(s)) return "Partial";
  if (/progress|process|pending|queue/i.test(s)) return "Processing";
  return s;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { orderId } = parsed.data;

  const { data: order, error: orderErr } = await supabase
    .from("smm_orders")
    .select("id, user_id, api_order_id, panel_api_id, panel_service_id, target_url, quantity, status")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (!order.panel_api_id) {
    return NextResponse.json({ error: "Panel API not linked for this order" }, { status: 400 });
  }

  const { data: panel, error: pErr } = await supabase
    .from("smm_panel_apis")
    .select("id, api_url, api_key, is_active")
    .eq("id", order.panel_api_id)
    .maybeSingle();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  if (!panel?.api_url || !panel.api_key) return NextResponse.json({ error: "Panel not configured" }, { status: 404 });
  if (panel.is_active === false) return NextResponse.json({ error: "Panel is disabled" }, { status: 400 });

  let apiOrderId = order.api_order_id ? String(order.api_order_id).trim() : "";

  // Backfill missing api_order_id for older rows by placing panel order now.
  if (!apiOrderId) {
    if (!order.panel_service_id || String(order.panel_service_id).trim() === "") {
      return NextResponse.json({ error: "Panel service id not linked for this order" }, { status: 400 });
    }
    const addParams = new URLSearchParams();
    addParams.set("key", String(panel.api_key).trim());
    addParams.set("action", "add");
    addParams.set("service", String(order.panel_service_id).trim());
    addParams.set("link", String(order.target_url ?? "").trim());
    addParams.set("quantity", String(Number(order.quantity ?? 1)));

    let addRes: Response;
    const addAc = new AbortController();
    const addT = setTimeout(() => addAc.abort(), FETCH_MS);
    try {
      addRes = await fetch(String(panel.api_url).trim(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/plain, */*",
        },
        body: addParams.toString(),
        signal: addAc.signal,
        cache: "no-store",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      return NextResponse.json(
        { error: msg.includes("abort") ? "Panel request timed out" : msg },
        { status: 502 }
      );
    } finally {
      clearTimeout(addT);
    }

    const addText = await addRes.text();
    let addPayload: unknown = addText;
    try {
      addPayload = addText ? JSON.parse(addText) : null;
    } catch {
      /* keep raw */
    }
    const addObj =
      addPayload && typeof addPayload === "object" ? (addPayload as Record<string, unknown>) : {};
    const addedOrderIdRaw = addObj.order ?? addObj.id ?? null;
    apiOrderId = addedOrderIdRaw != null ? String(addedOrderIdRaw).trim() : "";
    if (!addRes.ok || !apiOrderId) {
      return NextResponse.json(
        {
          error: !addRes.ok ? `Panel HTTP ${addRes.status}` : "Panel did not return order id",
          panelResponse: addObj,
        },
        { status: 502 }
      );
    }
    await supabase
      .from("smm_orders")
      .update({
        api_order_id: apiOrderId,
        api_status_payload: addObj,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  const params = new URLSearchParams();
  params.set("key", String(panel.api_key).trim());
  params.set("action", "status");
  params.set("order", apiOrderId);

  let res: Response;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_MS);
  try {
    res = await fetch(String(panel.api_url).trim(), {
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
      { error: msg.includes("abort") ? "Panel request timed out" : msg },
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
    /* keep raw */
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `Panel HTTP ${res.status}`, panelResponse: payload },
      { status: 502 }
    );
  }

  const obj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const nextStatus =
    normalizePanelStatus(obj.status) ??
    normalizePanelStatus(obj.state) ??
    normalizePanelStatus(obj.order_status) ??
    null;

  const updatePatch: Record<string, unknown> = {
    api_status_payload: obj,
    updated_at: new Date().toISOString(),
  };
  if (nextStatus) updatePatch.status = nextStatus;

  const { error: updErr } = await supabase.from("smm_orders").update(updatePatch).eq("id", orderId);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    status: nextStatus ?? String(order.status),
    panelResponse: obj,
  });
}

