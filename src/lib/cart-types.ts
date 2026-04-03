import type { SocialPlatformId } from "@/components/home/social-brand";
import type { PremiumBrandId } from "@/lib/services-data";

/** Single-item cart: one SMM or one premium line. */
export type CartSmmLine = {
  kind: "smm";
  productId: string;
  productName: string;
  platform: SocialPlatformId;
  tierId: string;
  tierSummary: string;
  price: number;
  profileUrl: string;
};

export type CartPremiumLine = {
  kind: "premium";
  productId: string;
  productName: string;
  brandId: PremiumBrandId;
  planId: string;
  planSummary: string;
  price: number;
  deliveryEmail: string;
};

export type CartLine = CartSmmLine | CartPremiumLine;

export const CART_STORAGE_KEY = "curator-market-cart-v1";

export function loadCartFromStorage(): CartLine | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (o.kind === "smm") {
      if (
        typeof o.productId === "string" &&
        typeof o.productName === "string" &&
        typeof o.platform === "string" &&
        typeof o.tierId === "string" &&
        typeof o.tierSummary === "string" &&
        typeof o.price === "number" &&
        typeof o.profileUrl === "string"
      ) {
        return o as CartSmmLine;
      }
    }
    if (o.kind === "premium") {
      if (
        typeof o.productId === "string" &&
        typeof o.productName === "string" &&
        typeof o.brandId === "string" &&
        typeof o.planId === "string" &&
        typeof o.planSummary === "string" &&
        typeof o.price === "number" &&
        typeof o.deliveryEmail === "string"
      ) {
        return o as CartPremiumLine;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveCartToStorage(line: CartLine | null) {
  if (typeof window === "undefined") return;
  if (line === null) localStorage.removeItem(CART_STORAGE_KEY);
  else localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(line));
}
