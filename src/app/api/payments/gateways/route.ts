import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { GatewayPublic, GatewayKey } from "@/lib/payment-gateways";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ gateways: [] as GatewayPublic[] });
  }

  const { data } = await supabase
    .from("payment_gateways")
    .select("gateway_key, display_name, is_enabled")
    .eq("is_enabled", true)
    .order("gateway_key", { ascending: true });

  const gateways: GatewayPublic[] = (data ?? []).map((g: any) => ({
    key: String(g.gateway_key) as GatewayKey,
    label: String(g.display_name ?? g.gateway_key),
    isEnabled: Boolean(g.is_enabled),
  }));

  return NextResponse.json({ gateways });
}

