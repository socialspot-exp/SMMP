import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);

  const { data, error } = await supabase
    .from("smm_orders")
    .select(
      `
        id,
        order_ref,
        smm_product_id,
        product_name,
        platform,
        target_url,
        tier_id,
        tier_summary,
        price,
        quantity,
        api_order_id,
        status,
        submitted_form,
        created_at
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    orders: (data ?? []).map((r: any) => ({
      id: String(r.id),
      orderRef: String(r.order_ref),
      productId: r.smm_product_id != null ? String(r.smm_product_id) : null,
      productName: String(r.product_name),
      platform: r.platform != null ? String(r.platform) : null,
      targetUrl: String(r.target_url),
      tierId: r.tier_id != null ? String(r.tier_id) : null,
      tierSummary: r.tier_summary != null ? String(r.tier_summary) : null,
      amount: Number(r.price),
      quantity: r.quantity != null ? Number(r.quantity) : 1,
      apiOrderId: r.api_order_id != null ? String(r.api_order_id) : null,
      status: String(r.status),
      submittedForm:
        r.submitted_form && typeof r.submitted_form === "object"
          ? (r.submitted_form as Record<string, unknown>)
          : {},
      createdAt: String(r.created_at),
    })),
  });
}

