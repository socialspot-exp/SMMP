import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await ctx.params;
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { data: order, error: orderErr } = await supabase
    .from("premium_orders")
    .select("id, order_ref, user_id")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const { data: credsRow } = await supabase
    .from("premium_order_credentials")
    .select("credentials, credentials_items, provided_at")
    .eq("order_id", orderId)
    .maybeSingle();

  // Mark notifications as read when user actually fetches/reads the credentials.
  await supabase.from("premium_order_notifications").update({ is_read: true }).eq("order_id", orderId).eq("user_id", userId).eq("type", "credentials_provided").eq("is_read", false);

  return NextResponse.json({
    orderRef: String(order.order_ref),
    credentials: credsRow?.credentials ?? null,
    credentialsItems: credsRow?.credentials_items ?? null,
    providedAt: credsRow?.provided_at ?? null,
  });
}

