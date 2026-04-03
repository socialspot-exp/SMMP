import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  CREDENTIAL_FIELDS,
  GATEWAY_ORDER,
  maskCredentials,
  sanitizeCredentials,
  type GatewayConfigRow,
  type GatewayKey,
} from "@/lib/payment-gateways";
import { requireAdminApi } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

function isGatewayKey(v: string): v is GatewayKey {
  return GATEWAY_ORDER.includes(v as GatewayKey);
}

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { data, error } = await supabase
    .from("payment_gateways")
    .select("gateway_key, display_name, is_enabled, credentials, webhook_secret, webhook_url, metadata, updated_at")
    .order("gateway_key", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((r: any) => {
    const key = String(r.gateway_key) as GatewayKey;
    const creds = sanitizeCredentials(r.credentials);
    return {
      gateway_key: key,
      display_name: String(r.display_name ?? key),
      is_enabled: Boolean(r.is_enabled),
      credentials: maskCredentials(creds),
      webhook_secret_masked: r.webhook_secret ? `${String(r.webhook_secret).slice(0, 3)}***` : null,
      webhook_url: r.webhook_url ?? null,
      metadata: (r.metadata as Record<string, unknown>) ?? {},
      updated_at: String(r.updated_at ?? new Date().toISOString()),
      fields: CREDENTIAL_FIELDS[key] ?? [],
    };
  });

  return NextResponse.json({ gateways: rows });
}

export async function PATCH(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = (await req.json()) as Partial<GatewayConfigRow> & { gateway_key?: string };
  const gateway = body.gateway_key;
  if (!gateway || !isGatewayKey(gateway)) {
    return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.display_name === "string") patch.display_name = body.display_name.trim() || gateway;
  if (typeof body.is_enabled === "boolean") patch.is_enabled = body.is_enabled;
  if (body.credentials !== undefined) patch.credentials = sanitizeCredentials(body.credentials);
  if (body.webhook_secret !== undefined) {
    patch.webhook_secret =
      typeof body.webhook_secret === "string" && body.webhook_secret.trim()
        ? body.webhook_secret.trim()
        : null;
  }
  if (body.webhook_url !== undefined) {
    patch.webhook_url =
      typeof body.webhook_url === "string" && body.webhook_url.trim() ? body.webhook_url.trim() : null;
  }
  if (body.metadata !== undefined && typeof body.metadata === "object" && body.metadata !== null) {
    patch.metadata = body.metadata;
  }

  const { data, error } = await supabase
    .from("payment_gateways")
    .update(patch)
    .eq("gateway_key", gateway)
    .select("gateway_key, display_name, is_enabled, credentials, webhook_secret, webhook_url, metadata, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const key = String(data.gateway_key) as GatewayKey;
  return NextResponse.json({
    gateway: {
      gateway_key: key,
      display_name: String(data.display_name ?? key),
      is_enabled: Boolean(data.is_enabled),
      credentials: maskCredentials(sanitizeCredentials(data.credentials)),
      webhook_secret_masked: data.webhook_secret ? `${String(data.webhook_secret).slice(0, 3)}***` : null,
      webhook_url: data.webhook_url ?? null,
      metadata: (data.metadata as Record<string, unknown>) ?? {},
      updated_at: String(data.updated_at),
      fields: CREDENTIAL_FIELDS[key] ?? [],
    },
  });
}

