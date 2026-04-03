export type GatewayKey = "paytm" | "razorpay" | "cryptomus" | "cashfree";

export type GatewayConfigRow = {
  gateway_key: GatewayKey;
  display_name: string;
  is_enabled: boolean;
  credentials: Record<string, string | null>;
  webhook_secret: string | null;
  webhook_url: string | null;
  metadata: Record<string, unknown>;
  updated_at: string;
};

export type GatewayPublic = {
  key: GatewayKey;
  label: string;
  isEnabled: boolean;
};

export const GATEWAY_ORDER: GatewayKey[] = ["paytm", "razorpay", "cryptomus", "cashfree"];

export const CREDENTIAL_FIELDS: Record<GatewayKey, { key: string; label: string; placeholder?: string }[]> = {
  paytm: [
    { key: "merchant_id", label: "Merchant ID" },
    { key: "merchant_key", label: "Merchant Key / Secret" },
    { key: "website", label: "Website", placeholder: "WEBSTAGING / DEFAULT" },
    { key: "industry_type", label: "Industry Type", placeholder: "Retail" },
  ],
  razorpay: [
    { key: "key_id", label: "Key ID" },
    { key: "key_secret", label: "Key Secret" },
    { key: "account_id", label: "Account ID (optional)" },
  ],
  cryptomus: [
    { key: "merchant_uuid", label: "Merchant UUID" },
    { key: "payment_api_key", label: "Payment API Key" },
  ],
  cashfree: [
    { key: "app_id", label: "App ID / Client ID" },
    { key: "secret_key", label: "Secret Key / Client Secret" },
    { key: "environment", label: "Environment", placeholder: "sandbox / production" },
  ],
};

export function sanitizeCredentials(input: unknown): Record<string, string | null> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (v == null) out[k] = null;
  }
  return out;
}

export function maskCredentials(
  credentials: Record<string, string | null>
): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(credentials)) {
    if (!v) out[k] = v;
    else if (/secret|key|token|password/i.test(k)) {
      out[k] = `${v.slice(0, 3)}***${v.slice(-2)}`;
    } else {
      out[k] = v;
    }
  }
  return out;
}

