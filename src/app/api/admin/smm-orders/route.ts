import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApi } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 500), 1), 1000);

  const { data, error } = await supabase
    .from("smm_orders")
    .select(
      `
        id,
        order_ref,
        api_order_id,
        product_name,
        platform,
        target_url,
        quantity,
        amount:price,
        status,
        api_status_payload,
        created_at,
        profiles(email, user_no, username)
      `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    orders: (data ?? []).map((r: any) => ({
      id: String(r.id),
      orderRef: String(r.order_ref),
      apiOrderId: r.api_order_id != null ? String(r.api_order_id) : null,
      productName: String(r.product_name),
      platform: r.platform != null ? String(r.platform) : null,
      targetUrl: String(r.target_url),
      quantity: r.quantity != null ? Number(r.quantity) : 1,
      amount: Number(r.amount),
      status: String(r.status),
      apiStatusPayload:
        r.api_status_payload && typeof r.api_status_payload === "object"
          ? (r.api_status_payload as Record<string, unknown>)
          : {},
      createdAt: String(r.created_at),
      customerEmail: r.profiles?.email ?? "—",
      customerUserNo: r.profiles?.user_no != null ? Number(r.profiles.user_no) : null,
      customerUsername: r.profiles?.username ?? null,
    })),
  });
}

