import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  PremiumBilling,
  PremiumBrandId,
  PremiumCategory,
  PremiumQuantityOption,
  PremiumTopFeature,
  PremiumService,
} from "@/lib/services-data";
import { PREMIUM_SERVICES } from "@/lib/services-data";
import {
  isPremiumCatalogIconKey,
  PREMIUM_CATALOG_ICON_MAP,
} from "@/lib/premium-catalog-icons";
import type { PremiumCatalogIconKey } from "@/lib/premium-catalog-icons";

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Map catalog brand icon keys to storefront `brandId` for marks / cart. */
export function brandIdFromPremiumIconKey(iconKey: string | null | undefined): PremiumBrandId {
  if (!iconKey) return "generic";
  const map: Record<string, PremiumBrandId> = {
    Netflix: "netflix",
    Spotify: "spotify",
    Discord: "discord",
    HBOMAX: "hbomax",
    Max: "hbomax",
    HBO: "hbomax",
    Youtube: "generic",
    AppleTV: "generic",
    AppleMusic: "generic",
    Prime: "prime",
    Disney: "generic",
    ParamountPlus: "generic",
  };
  return map[iconKey] ?? "generic";
}

export type PremiumProductFaq = { q: string; a: string };

export type PremiumProductRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  billing: string;
  brand_id: string;
  price_from: number;
  featured: boolean;
  rating: number;
  review_count: number;
  top_review: string | null;
  seats: string | null;
  is_active: boolean;
  catalog_category_id: string | null;
  catalog_subcategory_id: string | null;
  slug: string | null;
  long_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image_url: string | null;
  robots: string | null;
  checkout_field_label: string | null;
  icon_key: string | null;
  faqs: PremiumProductFaq[];
  features: string[];
  top_features: PremiumTopFeature[];
  quantity_options: PremiumQuantityOption[];
  created_at: string;
  updated_at: string;
};

const PREMIUM_SELECT_FULL =
  "id, name, description, category, billing, brand_id, price_from, featured, rating, review_count, top_review, seats, is_active, catalog_category_id, catalog_subcategory_id, slug, long_description, meta_title, meta_description, meta_keywords, og_image_url, robots, checkout_field_label, icon_key, faqs, features, top_features, quantity_options, created_at, updated_at";

const PREMIUM_SELECT_LEGACY =
  "id, name, description, category, billing, brand_id, price_from, featured, rating, review_count, top_review, seats, is_active, catalog_category_id, catalog_subcategory_id, created_at, updated_at";

function isMissingColumnError(message: string): boolean {
  if (/\bcolumn\b[\s\S]*\bdoes not exist\b/i.test(message)) return true;
  if (/could not find the ['"][^'"]+['"] column/i.test(message)) return true;
  return false;
}

const KNOWN_CATEGORIES: PremiumCategory[] = [
  "streaming",
  "music",
  "gaming",
  "productivity",
  "vpn",
];

const KNOWN_BILLING: PremiumBilling[] = ["monthly", "yearly", "one-time"];

const KNOWN_BRANDS: PremiumBrandId[] = [
  "netflix",
  "prime",
  "spotify",
  "discord",
  "creative",
  "vpn",
  "hbomax",
  "generic",
];

function asPremiumCategory(slug: string): PremiumCategory {
  return (KNOWN_CATEGORIES.includes(slug as PremiumCategory) ? slug : "streaming") as PremiumCategory;
}

function asPremiumBilling(slug: string): PremiumBilling {
  return (KNOWN_BILLING.includes(slug as PremiumBilling) ? slug : "monthly") as PremiumBilling;
}

function asBrandId(raw: string): PremiumBrandId {
  return (KNOWN_BRANDS.includes(raw as PremiumBrandId) ? raw : "generic") as PremiumBrandId;
}

function parseQuantityOptions(raw: unknown): PremiumQuantityOption[] {
  if (!Array.isArray(raw)) return [];
  const out: PremiumQuantityOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const qty = Number(o.qty);
    const price = Number(o.price);
    if (!Number.isFinite(qty) || qty < 1 || !Number.isFinite(price) || price < 0) continue;
    const row: PremiumQuantityOption = { qty, price };
    if (typeof o.badge === "string" && o.badge.trim()) row.badge = o.badge.trim();
    if (typeof o.subtitle === "string" && o.subtitle.trim()) row.subtitle = o.subtitle.trim();
    if (o.compareAt != null) {
      const c = Number(o.compareAt);
      if (Number.isFinite(c) && c >= 0) row.compareAt = c;
    }
    if (o.popular === true) row.popular = true;
    out.push(row);
  }
  return out;
}

function parseFaqs(raw: unknown): PremiumProductFaq[] {
  if (!Array.isArray(raw)) return [];
  const out: PremiumProductFaq[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const q = typeof o.q === "string" ? o.q.trim() : "";
    const a = typeof o.a === "string" ? o.a.trim() : "";
    if (q && a) out.push({ q, a });
  }
  return out;
}

function parseFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x)).filter((s) => s.trim().length > 0);
}

function parseTopFeatures(raw: unknown): PremiumTopFeature[] {
  if (!Array.isArray(raw)) return [];
  const out: PremiumTopFeature[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const iconRaw = typeof o.icon_key === "string" ? o.icon_key.trim() : null;
    const iconKey = iconRaw ? normalizePremiumCatalogIconKey(iconRaw) : null;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const description = typeof o.description === "string" ? o.description.trim() : "";
    if (!iconKey || !title || !description) continue;
    out.push({ iconKey, title, description });
  }
  return out;
}

function normalizePremiumCatalogIconKey(iconKey: string): PremiumCatalogIconKey {
  if (isPremiumCatalogIconKey(iconKey)) return iconKey;

  // Case-insensitive match (helps avoid SSR/client mismatches if DB has inconsistent casing).
  const hit = Object.keys(PREMIUM_CATALOG_ICON_MAP).find(
    (k) => k.toLowerCase() === iconKey.toLowerCase()
  );
  if (hit && isPremiumCatalogIconKey(hit)) return hit;
  return "Sparkles";
}

export function premiumRowToService(r: PremiumProductRow): PremiumService {
  const qtyOpts = r.quantity_options.length > 0 ? r.quantity_options : undefined;
  const derivedBrand =
    r.icon_key && r.icon_key.trim()
      ? brandIdFromPremiumIconKey(r.icon_key.trim())
      : asBrandId(r.brand_id);
  let priceFrom = Number(r.price_from);
  if (qtyOpts && qtyOpts.length > 0) {
    const mins = qtyOpts.map((x) => x.price).filter((n) => Number.isFinite(n));
    if (mins.length > 0) priceFrom = Math.min(...mins);
  }
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    category: asPremiumCategory(r.category),
    billing: asPremiumBilling(r.billing),
    brandId: derivedBrand,
    priceFrom,
    featured: r.featured,
    rating: Number(r.rating),
    reviewCount: Number(r.review_count),
    topReview: r.top_review ?? undefined,
    seats: r.seats ?? undefined,
    slug: r.slug ?? undefined,
    longDescription: r.long_description?.trim() ? r.long_description.trim() : undefined,
    quantityOptions: qtyOpts,
    checkoutFieldLabel: r.checkout_field_label?.trim() || null,
    features: r.features.length > 0 ? r.features : undefined,
    topFeatures: r.top_features.length > 0 ? r.top_features : undefined,
    faqs: r.faqs.length > 0 ? r.faqs : undefined,
    metaTitle: r.meta_title?.trim() || undefined,
    metaDescription: r.meta_description?.trim() || undefined,
    metaKeywords: r.meta_keywords?.trim() || undefined,
    ogImageUrl: r.og_image_url?.trim() || undefined,
    robots: r.robots?.trim() || null,
    iconKey: r.icon_key?.trim() || null,
  };
}

export function premiumProductRowFromApiJson(r: Record<string, unknown>): PremiumProductRow {
  return {
    id: String(r.id),
    name: String(r.name),
    description: String(r.description),
    category: String(r.category),
    billing: String(r.billing),
    brand_id: String(r.brand_id),
    price_from: Number(r.price_from),
    featured: Boolean(r.featured),
    rating: Number(r.rating),
    review_count: Number(r.review_count),
    top_review: r.top_review != null ? String(r.top_review) : null,
    seats: r.seats != null ? String(r.seats) : null,
    is_active: r.is_active !== false,
    catalog_category_id: r.catalog_category_id != null ? String(r.catalog_category_id) : null,
    catalog_subcategory_id: r.catalog_subcategory_id != null ? String(r.catalog_subcategory_id) : null,
    slug: r.slug != null && String(r.slug).trim() ? String(r.slug).trim() : null,
    long_description: r.long_description != null ? String(r.long_description) : null,
    meta_title: r.meta_title != null ? String(r.meta_title) : null,
    meta_description: r.meta_description != null ? String(r.meta_description) : null,
    meta_keywords: r.meta_keywords != null ? String(r.meta_keywords) : null,
    og_image_url: r.og_image_url != null ? String(r.og_image_url) : null,
    robots: r.robots != null ? String(r.robots) : null,
    checkout_field_label: r.checkout_field_label != null ? String(r.checkout_field_label) : null,
    icon_key: r.icon_key != null && String(r.icon_key).trim() ? String(r.icon_key).trim() : null,
    faqs: parseFaqs(r.faqs),
    features: parseFeatures(r.features),
    top_features: parseTopFeatures(r.top_features),
    quantity_options: parseQuantityOptions(r.quantity_options),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

async function fetchRows(client: SupabaseClient, onlyActive: boolean) {
  async function query(selectColumns: string) {
    let q = client.from("premium_products").select(selectColumns).order("created_at", { ascending: false });
    if (onlyActive) q = q.eq("is_active", true);
    return q;
  }
  let res = await query(PREMIUM_SELECT_FULL);
  if (res.error && isMissingColumnError(res.error.message)) {
    res = (await query(PREMIUM_SELECT_LEGACY)) as typeof res;
  }
  return res;
}

export async function fetchPremiumProductsAdmin(): Promise<
  { ok: true; rows: PremiumProductRow[] } | { ok: false; error: string }
> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { data, error } = await fetchRows(supabase, false);
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    rows: (data ?? []).map((r) => premiumProductRowFromApiJson(r as unknown as Record<string, unknown>)),
  };
}

export async function fetchPremiumProductsPublic(): Promise<
  { ok: true; products: PremiumService[] } | { ok: false; error: string }
> {
  const supabase = createAnonClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { data, error } = await fetchRows(supabase, true);
  if (error) return { ok: false, error: error.message };
  const rows = (data ?? []).map((r) => premiumProductRowFromApiJson(r as unknown as Record<string, unknown>));
  return { ok: true, products: rows.map(premiumRowToService) };
}

export async function nextPremiumProductId(): Promise<
  { ok: true; id: string } | { ok: false; error: string }
> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { data, error } = await supabase.from("premium_products").select("id");
  if (error) return { ok: false, error: error.message };

  const nums = (data ?? [])
    .map((r) => parseInt(String(r.id).replace(/^P/i, ""), 10))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  if (next > 999) return { ok: false, error: "Premium product id space exhausted (max P999)" };
  return { ok: true, id: `P${String(next).padStart(3, "0")}` };
}

export async function getPremiumCatalogForStorefront(): Promise<PremiumService[]> {
  const res = await fetchPremiumProductsPublic();
  if (res.ok && res.products.length > 0) return res.products;
  return PREMIUM_SERVICES;
}
