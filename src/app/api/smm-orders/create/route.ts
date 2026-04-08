import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { upsertProfileFromClerkBackendUser } from "@/lib/upsert-clerk-profile";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  platform: z.string().min(1),
  tierId: z.string().min(1),
  tierSummary: z.string().min(1),
  price: z.number().nonnegative(),
  targetUrl: z.string().min(1).max(4000),
});

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

function inferOrderQuantity(tierId: string, tierSummary: string): number {
  const fromTierId = tierId.match(/q-\d+-(\d+(?:\.\d+)?)/i);
  if (fromTierId?.[1]) {
    const n = Number(fromTierId[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  const fromSummary = tierSummary.match(/([\d,]+(?:\.\d+)?)/);
  if (fromSummary?.[1]) {
    const n = Number(fromSummary[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  return 1;
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

  const { productId, productName, platform, tierId, tierSummary, price, targetUrl } = parsed.data;
  const quantity = inferOrderQuantity(tierId, tierSummary);

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  // Ensure FK `smm_orders.user_id -> profiles.id` exists.
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      await upsertProfileFromClerkBackendUser(clerkUser);
    }
  } catch {
    // ignore
  }

  // Pull panel linkage from product and use it to place panel order now.
  const { data: productRow } = await supabase
    .from("smm_products")
    .select("panel_api_id, panel_service_id")
    .eq("id", productId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("smm_orders")
    .insert({
      user_id: userId,
      smm_product_id: productId,
      product_name: productName,
      platform,
      target_url: targetUrl,
      tier_id: tierId,
      tier_summary: tierSummary,
      price,
      quantity,
      panel_api_id: productRow?.panel_api_id ?? null,
      panel_service_id: productRow?.panel_service_id ?? null,
      status: "Processing",
      submitted_form: {
        targetUrl,
        tierId,
        tierSummary,
        platform,
        quantity,
      },
    })
    .select("id, order_ref, panel_api_id, panel_service_id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to create order" }, { status: 500 });
  }

  const orderId = String(data.id);
  const panelApiId = data.panel_api_id ? String(data.panel_api_id) : null;
  const panelServiceId = data.panel_service_id ? String(data.panel_service_id) : null;

  if (!panelApiId || !panelServiceId) {
    return NextResponse.json({
      success: true,
      order: { id: orderId, orderRef: String(data.order_ref), apiOrderId: null },
      warning: "Panel API/service not linked on this product. Order created but not sent to panel.",
    });
  }

  const { data: panel, error: panelErr } = await supabase
    .from("smm_panel_apis")
    .select("id, api_url, api_key, is_active")
    .eq("id", panelApiId)
    .maybeSingle();

  if (panelErr || !panel?.api_url || !panel.api_key || panel.is_active === false) {
    await supabase
      .from("smm_orders")
      .update({
        api_status_payload: {
          error: panelErr?.message ?? "Panel unavailable, unconfigured, or disabled",
          stage: "panel_lookup",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    return NextResponse.json({
      success: true,
      order: { id: orderId, orderRef: String(data.order_ref), apiOrderId: null },
      warning: "Order created but panel is unavailable/configured incorrectly.",
    });
  }

  const params = new URLSearchParams();
  params.set("key", String(panel.api_key).trim());
  params.set("action", "add");
  params.set("service", panelServiceId);
  params.set("link", targetUrl);
  params.set("quantity", String(quantity));

  let panelRes: Response;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_MS);
  try {
    panelRes = await fetch(String(panel.api_url).trim(), {
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
    const msg = e instanceof Error ? e.message : "Panel request failed";
    await supabase
      .from("smm_orders")
      .update({
        api_status_payload: {
          error: msg.includes("abort") ? "Panel request timed out" : msg,
          stage: "panel_add",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    return NextResponse.json({
      success: true,
      order: { id: orderId, orderRef: String(data.order_ref), apiOrderId: null },
      warning: "Order created but panel order request failed.",
    });
  } finally {
    clearTimeout(t);
  }

  const text = await panelRes.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text */
  }
  const obj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const apiOrderIdRaw = obj.order ?? obj.id ?? null;
  const apiOrderId = apiOrderIdRaw != null ? String(apiOrderIdRaw).trim() : null;
  const nextStatus =
    normalizePanelStatus(obj.status) ??
    normalizePanelStatus(obj.state) ??
    normalizePanelStatus(obj.order_status) ??
    "Processing";

  if (!panelRes.ok || !apiOrderId) {
    await supabase
      .from("smm_orders")
      .update({
        status: "Processing",
        api_status_payload: {
          panel_http_status: panelRes.status,
          panel_response: obj,
          error: !panelRes.ok
            ? `Panel HTTP ${panelRes.status}`
            : "Panel did not return an order id",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    return NextResponse.json({
      success: true,
      order: { id: orderId, orderRef: String(data.order_ref), apiOrderId: null },
      warning: "Order created but panel did not return API order id.",
    });
  }

  await supabase
    .from("smm_orders")
    .update({
      api_order_id: apiOrderId,
      status: nextStatus,
      api_status_payload: obj,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return NextResponse.json({
    success: true,
    order: { id: orderId, orderRef: String(data.order_ref), apiOrderId },
  });
}

