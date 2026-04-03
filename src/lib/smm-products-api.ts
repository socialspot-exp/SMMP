import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SocialPlatformId } from "@/components/home/social-brand";
import { isSocialPlatformId } from "@/components/home/social-brand";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { SMMCategory, SMMDuration, SMMService } from "@/lib/services-data";
import { SMM_SERVICES } from "@/lib/services-data";

const KNOWN_SMM_CATEGORIES: SMMCategory[] = [
  "followers",
  "likes",
  "views",
  "comments",
  "shares",
  "subscribers",
  "watch-time",
];

export type SmmProductFaq = { q: string; a: string };

export type SmmProductQtyOptionRow = {
  qty: number;
  price: number;
  badge?: string | null;
  subtitle?: string | null;
  compareAt?: number | null;
  popular?: boolean;
};

export type SmmProductRow = {
  id: string;
  name: string;
  description: string;
  platform: string;
  category: string;
  price_from: number;
  duration: string;
  featured: boolean;
  rating: number;
  review_count: number;
  top_review: string | null;
  is_active: boolean;
  platform_id: string | null;
  subcategory_id: string | null;
  slug: string;
  long_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image_url: string | null;
  robots: string | null;
  panel_api_id: string | null;
  panel_service_id: string | null;
  order_qty_min: number | null;
  order_qty_max: number | null;
  faqs: SmmProductFaq[];
  quantity_options: SmmProductQtyOptionRow[];
  checkout_field_label: string | null;
  features: string[];
};

const SMM_PRODUCT_SELECT =
  "id, name, description, platform, category, price_from, duration, featured, rating, review_count, top_review, is_active, platform_id, subcategory_id, slug, long_description, meta_title, meta_description, meta_keywords, og_image_url, robots, panel_api_id, panel_service_id, order_qty_min, order_qty_max, faqs, quantity_options, checkout_field_label, features";

/** Before migrations 009–010; used when full select fails on missing columns. */
const SMM_PRODUCT_SELECT_LEGACY =
  "id, name, description, platform, category, price_from, duration, featured, rating, review_count, top_review, is_active, platform_id, subcategory_id, slug, long_description, meta_title, meta_description, meta_keywords, og_image_url, robots";

function isMissingColumnError(message: string): boolean {
  if (/\bcolumn\b[\s\S]*\bdoes not exist\b/i.test(message)) return true;
  // PostgREST / Supabase sometimes wording:
  if (/could not find the ['"][^'"]+['"] column/i.test(message)) return true;
  if (/schema cache/i.test(message) && /column/i.test(message)) return true;
  return false;
}

/** Path keys often use lowercase (`s002`); rows use `S002`. */
function smmIdLookupCandidates(key: string): string[] {
  const k = key.trim();
  const out = new Set<string>([k]);
  if (/^s\d+$/i.test(k)) {
    const m = k.match(/^s(\d+)$/i);
    if (m) out.add(`S${m[1]!.padStart(3, "0")}`);
  }
  return [...out];
}

async function fetchActiveProductRow(
  supabase: SupabaseClient,
  column: "id" | "slug",
  value: string
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  let res = await supabase
    .from("smm_products")
    .select(SMM_PRODUCT_SELECT)
    .eq("is_active", true)
    .eq(column, value)
    .maybeSingle();
  if (res.error && isMissingColumnError(res.error.message)) {
    res = await supabase
      .from("smm_products")
      .select(SMM_PRODUCT_SELECT_LEGACY)
      .eq("is_active", true)
      .eq(column, value)
      .maybeSingle();
  }
  return {
    data: (res.data as Record<string, unknown> | null) ?? null,
    error: res.error,
  };
}

export function parseSmmProductFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === "string") {
      const t = x.trim();
      if (t) out.push(t);
      continue;
    }
    if (x && typeof x === "object" && "text" in x) {
      const t = typeof (x as { text: unknown }).text === "string" ? (x as { text: string }).text.trim() : "";
      if (t) out.push(t);
    }
  }
  return out.slice(0, 40);
}

export function parseSmmProductFaqs(raw: unknown): SmmProductFaq[] {
  if (!Array.isArray(raw)) return [];
  const out: SmmProductFaq[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const q = typeof o.q === "string" ? o.q.trim() : "";
    const a = typeof o.a === "string" ? o.a.trim() : "";
    if (q && a) out.push({ q, a });
  }
  return out;
}

export function parseSmmProductQuantityOptions(raw: unknown): SmmProductQtyOptionRow[] {
  if (!Array.isArray(raw)) return [];
  const out: SmmProductQtyOptionRow[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const qty = toIntOrNull(o.qty);
    const price = typeof o.price === "number" && Number.isFinite(o.price) ? o.price : Number.parseFloat(String(o.price));
    if (qty == null || qty < 1 || !Number.isFinite(price) || price < 0) continue;
    const compareRaw = o.compareAt ?? o.compare_at;
    let compareAt: number | null = null;
    if (compareRaw != null) {
      const c = typeof compareRaw === "number" ? compareRaw : Number.parseFloat(String(compareRaw));
      if (Number.isFinite(c) && c >= 0) compareAt = c;
    }
    const badge = typeof o.badge === "string" ? o.badge : null;
    const subtitle = typeof o.subtitle === "string" ? o.subtitle : null;
    const row: SmmProductQtyOptionRow = {
      qty,
      price,
      badge,
      subtitle,
      compareAt,
    };
    if (o.popular === true) row.popular = true;
    out.push(row);
  }
  return out;
}

function toIntOrNull(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function normalizeSmmProductRow(raw: Record<string, unknown>): SmmProductRow {
  const base = raw as unknown as SmmProductRow;
  return {
    ...base,
    panel_api_id: base.panel_api_id ?? null,
    panel_service_id: base.panel_service_id ?? null,
    order_qty_min: toIntOrNull(raw.order_qty_min),
    order_qty_max: toIntOrNull(raw.order_qty_max),
    faqs: parseSmmProductFaqs(raw.faqs),
    quantity_options: parseSmmProductQuantityOptions(raw.quantity_options),
    checkout_field_label:
      typeof raw.checkout_field_label === "string" && raw.checkout_field_label.trim()
        ? raw.checkout_field_label.trim()
        : null,
    features: parseSmmProductFeatures(raw.features),
  };
}

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function resolveSmmCategorySlug(slug: string): SMMCategory {
  return (KNOWN_SMM_CATEGORIES as readonly string[]).includes(slug)
    ? (slug as SMMCategory)
    : "followers";
}

export function mapSmmRowToService(
  row: SmmProductRow,
  platformSlug: string
): SMMService {
  const platform: SocialPlatformId = isSocialPlatformId(platformSlug)
    ? platformSlug
    : "instagram";
  const category = resolveSmmCategorySlug(row.category);
  const duration = (["instant", "24h", "7d", "14d"] as const).includes(
    row.duration as SMMDuration
  )
    ? (row.duration as SMMDuration)
    : "24h";

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    platform,
    category,
    priceFrom: Number(row.price_from),
    duration,
    featured: row.featured,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    topReview: row.top_review ?? undefined,
    slug: row.slug,
    longDescription: row.long_description ?? undefined,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    metaKeywords: row.meta_keywords ?? undefined,
    ogImageUrl: row.og_image_url ?? undefined,
    robots: row.robots ?? undefined,
    orderQtyMin: row.order_qty_min != null ? row.order_qty_min : undefined,
    orderQtyMax: row.order_qty_max != null ? row.order_qty_max : undefined,
    faqs: row.faqs.length > 0 ? row.faqs : undefined,
    quantityOptions:
      row.quantity_options.length > 0
        ? row.quantity_options.map((x) => ({
            qty: x.qty,
            price: x.price,
            badge: x.badge ?? undefined,
            subtitle: x.subtitle ?? undefined,
            compareAt: x.compareAt ?? undefined,
            popular: x.popular,
          }))
        : undefined,
    checkoutFieldLabel: row.checkout_field_label ?? undefined,
    features: row.features.length > 0 ? row.features : undefined,
  };
}

/** Load platform slug for a product row (denormalized `platform` column or via FK). */
async function platformSlugForRow(
  supabase: SupabaseClient,
  row: SmmProductRow
): Promise<string> {
  if (row.platform_id) {
    const { data } = await supabase
      .from("smm_platforms")
      .select("slug")
      .eq("id", row.platform_id)
      .maybeSingle();
    const pl = data as { slug: string } | null;
    if (pl?.slug) return pl.slug;
  }
  return row.platform;
}

export async function fetchSmmProductPublicByKey(
  key: string
): Promise<{ ok: true; product: SMMService } | { ok: false; error: string }> {
  const supabase = createAnonClient();
  if (!supabase) {
    return { ok: false, error: "Supabase not configured" };
  }

  let row: SmmProductRow | null = null;
  for (const idKey of smmIdLookupCandidates(key)) {
    const byId = await fetchActiveProductRow(supabase, "id", idKey);
    if (byId.error) return { ok: false, error: byId.error.message };
    if (byId.data) {
      row = normalizeSmmProductRow(byId.data);
      break;
    }
  }
  if (!row) {
    const bySlug = await fetchActiveProductRow(supabase, "slug", key.trim());
    if (bySlug.error) return { ok: false, error: bySlug.error.message };
    row = bySlug.data ? normalizeSmmProductRow(bySlug.data) : null;
  }

  if (!row) return { ok: false, error: "Not found" };

  const platSlug = await platformSlugForRow(supabase, row);
  return { ok: true, product: mapSmmRowToService(row, platSlug) };
}

export async function fetchSmmProductsPublic(): Promise<{
  ok: true;
  products: SMMService[];
} | { ok: false; error: string }> {
  const supabase = createAnonClient();
  if (!supabase) {
    return { ok: false, error: "Supabase not configured" };
  }

  let { data: rows, error } = await supabase
    .from("smm_products")
    .select(SMM_PRODUCT_SELECT)
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error && isMissingColumnError(error.message)) {
    const r = await supabase
      .from("smm_products")
      .select(SMM_PRODUCT_SELECT_LEGACY)
      .eq("is_active", true)
      .order("id", { ascending: true });
    rows = r.data as typeof rows;
    error = r.error;
  }

  if (error) return { ok: false, error: error.message };

  const list: SMMService[] = [];
  for (const raw of rows ?? []) {
    const row = normalizeSmmProductRow(raw as Record<string, unknown>);
    const platSlug = await platformSlugForRow(supabase, row);
    list.push(mapSmmRowToService(row, platSlug));
  }

  return { ok: true, products: list };
}

export async function fetchSmmProductsAdmin(): Promise<{
  ok: true;
  rows: SmmProductRow[];
} | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase service role not configured" };
  }

  let { data: rows, error } = await supabase
    .from("smm_products")
    .select(SMM_PRODUCT_SELECT)
    .order("id", { ascending: true });

  if (error && isMissingColumnError(error.message)) {
    const r = await supabase
      .from("smm_products")
      .select(SMM_PRODUCT_SELECT_LEGACY)
      .order("id", { ascending: true });
    rows = r.data as typeof rows;
    error = r.error;
  }

  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    rows: (rows ?? []).map((r) => normalizeSmmProductRow(r as Record<string, unknown>)),
  };
}

export async function nextSmmProductId(): Promise<
  { ok: true; id: string } | { ok: false; error: string }
> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase service role not configured" };
  }

  const { data, error } = await supabase.from("smm_products").select("id");
  if (error) return { ok: false, error: error.message };

  const nums = (data ?? [])
    .map((r) => parseInt(String(r.id).replace(/^S/i, ""), 10))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  if (next > 999) return { ok: false, error: "SMM product id space exhausted (max S999)" };
  return { ok: true, id: `S${String(next).padStart(3, "0")}` };
}

/**
 * Product page: resolve SKU from URL key (id or slug) + full catalog for related blocks.
 */
export async function getSmmProductPageModel(key: string): Promise<{
  product: SMMService;
  catalog: SMMService[];
} | null> {
  const catalog = await getSmmCatalogForStorefront();
  const trimmed = key.trim();

  const single = await fetchSmmProductPublicByKey(trimmed);
  if (single.ok) return { product: single.product, catalog };

  const product =
    catalog.find(
      (p) =>
        p.id === trimmed ||
        p.id.toLowerCase() === trimmed.toLowerCase() ||
        (p.slug != null && p.slug === trimmed)
    ) ?? null;
  if (!product) return null;
  return { product, catalog };
}

/**
 * Merge DB catalog over static when Supabase returns products; otherwise static only.
 */
export async function getSmmCatalogForStorefront(): Promise<SMMService[]> {
  const res = await fetchSmmProductsPublic();
  if (res.ok && res.products.length > 0) return res.products;
  return SMM_SERVICES;
}
