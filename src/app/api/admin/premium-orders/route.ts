import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApi } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("premium_orders")
    .select(
      `
        id,
        order_ref,
        premium_product_id,
        product_name,
        delivery_email,
        vip,
        price,
        status,
        detail,
        credentials_state,
        credentials_provided_at,
        created_at,
        updated_at,
        premium_order_credentials (credentials, credentials_items, provided_at, updated_at, provided_by_id)
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = (data ?? []).map((row: any) => {
    const cred = row.premium_order_credentials;
    return {
      id: String(row.id),
      orderRef: String(row.order_ref),
      productName: String(row.product_name),
      deliveryEmail: String(row.delivery_email),
      vip: Boolean(row.vip),
      price: row.price != null ? String(row.price) : null,
      status: String(row.status),
      detail: row.detail != null ? String(row.detail) : null,

      credentialsState: String(row.credentials_state) as "pending" | "sent" | "failed",
      credentialsProvidedAt: row.credentials_provided_at ?? null,

      // Admin can edit/view actual credential payload.
      credentials:
        cred && typeof cred === "object" && "credentials" in cred && cred.credentials != null
          ? (cred.credentials as Record<string, string>)
          : ({} as Record<string, string>),
      credentialsItems:
        cred && typeof cred === "object" && "credentials_items" in cred && Array.isArray((cred as any).credentials_items)
          ? ((cred as any).credentials_items as Array<{ key: string; value: string }>)
          : [],
    };
  });

  return NextResponse.json({ orders });
}

