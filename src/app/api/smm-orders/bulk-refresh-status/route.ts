import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

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

/**
 * POST /api/smm-orders/bulk-refresh-status
 * Bulk refresh status for all user's SMM orders that have an apiOrderId
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    // Fetch all user's orders with apiOrderId and panel info
    const { data: orders, error: fetchError } = await supabase
      .from("smm_orders")
      .select("id, api_order_id, panel_api_id, status")
      .eq("user_id", userId)
      .not("api_order_id", "is", null)
      .not("panel_api_id", "is", null);

    if (fetchError) {
      console.error("[bulk-refresh-status] fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    // Get unique panel IDs
    const panelIds = [...new Set(orders.map((o) => o.panel_api_id).filter(Boolean))];
    
    // Fetch panel configs
    const { data: panels, error: panelErr } = await supabase
      .from("smm_panel_apis")
      .select("id, api_url, api_key, is_active")
      .in("id", panelIds);

    if (panelErr || !panels) {
      console.error("[bulk-refresh-status] panel fetch error:", panelErr);
      return NextResponse.json({ error: "Failed to fetch panel configs" }, { status: 500 });
    }

    const panelMap = new Map(panels.map((p) => [p.id, p]));

    // Refresh each order (in parallel)
    let updated = 0;
    await Promise.all(
      orders.map(async (order) => {
        try {
          const apiOrderId = order.api_order_id;
          const panel = panelMap.get(order.panel_api_id);
          
          if (!apiOrderId || !panel?.api_url || !panel.api_key || panel.is_active === false) {
            return;
          }

          const params = new URLSearchParams();
          params.set("key", String(panel.api_key).trim());
          params.set("action", "status");
          params.set("order", String(apiOrderId).trim());

          const ac = new AbortController();
          const t = setTimeout(() => ac.abort(), FETCH_MS);

          let res: Response;
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
            console.error(`[bulk-refresh-status] fetch error for order ${order.id}:`, e);
            return;
          } finally {
            clearTimeout(t);
          }

          if (!res.ok) return;

          const text = await res.text();
          let payload: unknown = text;
          try {
            payload = text ? JSON.parse(text) : null;
          } catch {
            /* keep raw */
          }

          const obj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
          const nextStatus =
            normalizePanelStatus(obj.status) ??
            normalizePanelStatus(obj.state) ??
            normalizePanelStatus(obj.order_status) ??
            null;

          if (nextStatus) {
            const updatePatch: Record<string, unknown> = {
              status: nextStatus,
              api_status_payload: obj,
              updated_at: new Date().toISOString(),
            };

            const { error: updateError } = await supabase
              .from("smm_orders")
              .update(updatePatch)
              .eq("id", order.id);

            if (!updateError) {
              updated++;
            }
          }
        } catch (err) {
          console.error(`[bulk-refresh-status] error for order ${order.id}:`, err);
        }
      })
    );

    return NextResponse.json({ updated });
  } catch (err) {
    console.error("[bulk-refresh-status] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
