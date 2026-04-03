import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { GATEWAY_ORDER, type GatewayKey } from "@/lib/payment-gateways";

export const dynamic = "force-dynamic";

function isGatewayKey(v: string): v is GatewayKey {
  return GATEWAY_ORDER.includes(v as GatewayKey);
}

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function computeCandidates(secret: string, raw: string): string[] {
  const hmacHex = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  const hmacBase64 = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("base64");
  return [hmacHex, hmacBase64];
}

export async function POST(req: Request, ctx: { params: Promise<{ gateway: string }> }) {
  const { gateway: gatewayParam } = await ctx.params;
  if (!isGatewayKey(gatewayParam)) {
    return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });
  }
  const gateway = gatewayParam as GatewayKey;

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { data: config, error: cfgErr } = await supabase
    .from("payment_gateways")
    .select("gateway_key, is_enabled, webhook_secret")
    .eq("gateway_key", gateway)
    .maybeSingle();

  if (cfgErr || !config) return NextResponse.json({ error: "Gateway not configured" }, { status: 404 });

  const raw = await req.text();
  let payload: unknown = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = { raw };
  }

  const knownHeaderNames = [
    "x-razorpay-signature",
    "x-paytm-signature",
    "x-cashfree-signature",
    "x-webhook-signature",
    "x-signature",
    "signature",
    "sign",
  ];
  const signatureHeader =
    knownHeaderNames.map((h) => req.headers.get(h)).find((v) => typeof v === "string" && v.length > 0) ?? null;

  if (config.webhook_secret) {
    if (!signatureHeader) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    const normalized = signatureHeader.trim();
    const candidates = computeCandidates(String(config.webhook_secret), raw);
    const ok = candidates.some((c) => safeEqual(c, normalized));
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const obj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const eventType =
    (typeof obj.event === "string" && obj.event) ||
    (typeof obj.type === "string" && obj.type) ||
    (typeof obj.status === "string" && obj.status) ||
    null;
  const eventId =
    (typeof obj.event_id === "string" && obj.event_id) ||
    (typeof obj.id === "string" && obj.id) ||
    null;
  const status =
    (typeof obj.payment_status === "string" && obj.payment_status) ||
    (typeof obj.status === "string" && obj.status) ||
    null;
  const amountRaw =
    (typeof obj.amount === "number" && obj.amount) ||
    (typeof obj.amount === "string" && Number(obj.amount)) ||
    null;
  const currency = (typeof obj.currency === "string" && obj.currency) || null;
  const orderRef =
    (typeof obj.order_id === "string" && obj.order_id) ||
    (typeof obj.orderId === "string" && obj.orderId) ||
    null;

  await supabase.from("payment_events").insert({
    gateway_key: gateway,
    event_id: eventId,
    event_type: eventType,
    status,
    amount: amountRaw,
    currency,
    order_ref: orderRef,
    payload: obj,
    signature_header: signatureHeader,
  });

  return NextResponse.json({ ok: true });
}

