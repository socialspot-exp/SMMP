import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { upsertProfileFromClerkBackendUser } from "@/lib/upsert-clerk-profile";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  deliveryEmail: z.string().email(),
  planSummary: z.string().optional().nullable(),
  price: z.number().nonnegative(),
});

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

  const { productId, productName, deliveryEmail, planSummary, price } = parsed.data;

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  // Ensure FK `premium_orders.user_id -> profiles.id` always exists.
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      await upsertProfileFromClerkBackendUser(clerkUser);
    }
  } catch {
    // Don't block order creation if profile upsert fails; it'll fail loudly on FK if needed.
  }

  const priceText = `$${price.toFixed(2)}`;

  const { data, error } = await supabase
    .from("premium_orders")
    .insert({
      user_id: userId,
      premium_product_id: productId,
      product_name: productName,
      delivery_email: deliveryEmail,
      vip: false,
      price: priceText,
      status: "Awaiting Credentials",
      detail: planSummary ?? null,
      submitted_form: {
        deliveryEmail,
        planSummary: planSummary ?? null,
      },
    })
    .select("id, order_ref")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to create order" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    order: {
      id: String(data.id),
      orderRef: String(data.order_ref),
    },
  });
}

