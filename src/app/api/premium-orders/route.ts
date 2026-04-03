import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { data: orders, error: ordersErr } = await supabase
    .from("premium_orders")
    .select(
      `
        id,
        order_ref,
        product_name,
        delivery_email,
        vip,
        price,
        submitted_form,
        status,
        detail,
        credentials_state,
        credentials_provided_at,
        updated_at,
        created_at
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (ordersErr) {
    return NextResponse.json({ error: ordersErr.message }, { status: 500 });
  }

  const orderList = (orders ?? []).map((row: any) => ({
    id: String(row.id),
    orderRef: String(row.order_ref),
    productName: String(row.product_name),
    deliveryEmail: String(row.delivery_email),
    vip: Boolean(row.vip),
    price: row.price != null ? String(row.price) : null,
    submittedForm:
      row.submitted_form && typeof row.submitted_form === "object" ? (row.submitted_form as Record<string, unknown>) : {},
    status: String(row.status),
    detail: row.detail != null ? String(row.detail) : null,
    credentialsState: String(row.credentials_state) as "pending" | "sent" | "failed",
    credentialsProvidedAt: row.credentials_provided_at ?? null,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }));

  const orderIds = orderList.map((o) => o.id);
  let unreadByOrder: Record<string, boolean> = {};

  if (orderIds.length > 0) {
    const { data: notifications } = await supabase
      .from("premium_order_notifications")
      .select("order_id, is_read")
      .eq("user_id", userId)
      .eq("type", "credentials_provided")
      .eq("is_read", false)
      .in("order_id", orderIds);

    unreadByOrder = (notifications ?? []).reduce((acc: Record<string, boolean>, n: any) => {
      acc[String(n.order_id)] = true;
      return acc;
    }, {});
  }

  return NextResponse.json({
    orders: orderList.map((o) => ({
      ...o,
      hasUnreadCredentialsNotification: Boolean(unreadByOrder[o.id]),
    })),
  });
}

