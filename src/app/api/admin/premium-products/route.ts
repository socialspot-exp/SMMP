import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  brandIdFromPremiumIconKey,
  fetchPremiumProductsAdmin,
  nextPremiumProductId,
  type PremiumProductRow,
} from "@/lib/premium-products-api";

export const dynamic = "force-dynamic";

const slugRe = /^[a-z0-9][a-z0-9-]{0,100}$/;

const ogSchema = z
  .union([z.string().url().max(2000), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v));

const faqItemSchema = z.object({
  q: z.string().min(1).max(500),
  a: z.string().min(1).max(8000),
});

const topFeatureSchema = z.object({
  icon_key: z.string().max(80).optional().nullable(),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
});

const premiumQtyOptionSchema = z.object({
  qty: z.number().int().min(1).max(2_147_483_647),
  price: z.number().nonnegative().max(1_000_000),
  badge: z.string().max(40).optional().nullable(),
  subtitle: z.string().max(300).optional().nullable(),
  compareAt: z.number().nonnegative().max(1_000_000).optional().nullable(),
  popular: z.boolean().optional(),
});

const productBody = z.object({
  name: z.string().min(1).max(500),
  description: z.string().min(1).max(8000),
  catalog_category_id: z.string().uuid(),
  catalog_subcategory_id: z.string().uuid(),
  icon_key: z.string().max(80).optional().nullable(),
  slug: z.union([z.string().max(102).regex(slugRe), z.literal("")]).optional().nullable(),
  long_description: z.string().max(20000).optional().nullable(),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  meta_keywords: z.string().max(500).optional().nullable(),
  og_image_url: ogSchema,
  robots: z.string().max(200).optional().nullable(),
  checkout_field_label: z.string().max(200).optional().nullable(),
  price_from: z.number().nonnegative().max(1_000_000),
  featured: z.boolean().optional().default(false),
  rating: z.number().min(0).max(5),
  review_count: z.number().int().nonnegative().max(50_000_000),
  top_review: z.string().max(2000).optional().nullable(),
  seats: z.string().max(200).optional().nullable(),
  is_active: z.boolean().optional().default(true),
  faqs: z.array(faqItemSchema).max(50).optional(),
  features: z.array(z.string().min(1).max(300)).max(30).optional(),
  top_features: z.array(topFeatureSchema).max(12).optional(),
  quantity_options: z.array(premiumQtyOptionSchema).max(12).optional(),
});

const patchSchema = productBody.partial().extend({
  id: z.string().regex(/^P[0-9]{3}$/),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().regex(/^P[0-9]{3}$/)).min(1).max(200),
});

function resolvedPriceFrom(
  priceFrom: number,
  tiers: { price: number }[] | undefined
): number {
  if (tiers && tiers.length > 0) {
    const mins = tiers.map((t) => t.price).filter((n) => Number.isFinite(n));
    if (mins.length > 0) return Math.min(...mins);
  }
  return priceFrom;
}

async function resolvePremiumTaxonomy(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  catalogCategoryId: string,
  catalogSubcategoryId: string
): Promise<{ categorySlug: string; billingSlug: string } | { error: string }> {
  const { data: sub, error: eSub } = await supabase
    .from("premium_catalog_subcategories")
    .select("id, category_id, slug")
    .eq("id", catalogSubcategoryId)
    .maybeSingle();

  if (eSub || !sub) return { error: "Invalid offer (subcategory) id" };
  if (sub.category_id !== catalogCategoryId) {
    return { error: "Offer does not belong to the selected category" };
  }

  const { data: cat, error: eCat } = await supabase
    .from("premium_catalog_categories")
    .select("slug")
    .eq("id", catalogCategoryId)
    .maybeSingle();

  if (eCat || !cat?.slug) return { error: "Invalid premium category id" };

  return { categorySlug: cat.slug, billingSlug: sub.slug };
}

function rowToJson(row: PremiumProductRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    billing: row.billing,
    brand_id: row.brand_id,
    price_from: row.price_from,
    featured: row.featured,
    rating: row.rating,
    review_count: row.review_count,
    top_review: row.top_review,
    seats: row.seats,
    is_active: row.is_active,
    catalog_category_id: row.catalog_category_id,
    catalog_subcategory_id: row.catalog_subcategory_id,
    slug: row.slug,
    long_description: row.long_description,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    meta_keywords: row.meta_keywords,
    og_image_url: row.og_image_url,
    robots: row.robots,
    checkout_field_label: row.checkout_field_label,
    icon_key: row.icon_key,
    faqs: row.faqs,
    features: row.features,
    top_features: row.top_features,
    quantity_options: row.quantity_options,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET() {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const res = await fetchPremiumProductsAdmin();
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    return NextResponse.json({ products: res.rows.map(rowToJson) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = productBody.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const tax = await resolvePremiumTaxonomy(
      supabase,
      body.catalog_category_id,
      body.catalog_subcategory_id
    );
    if ("error" in tax) {
      return NextResponse.json({ error: tax.error }, { status: 400 });
    }

    const idRes = await nextPremiumProductId();
    if (!idRes.ok) {
      return NextResponse.json({ error: idRes.error }, { status: 400 });
    }

    const iconKey = body.icon_key?.trim() || null;
    const brandId = brandIdFromPremiumIconKey(iconKey);

    const qtyOpts = body.quantity_options ?? [];
    const priceStored = resolvedPriceFrom(body.price_from, qtyOpts);

    const insert = {
      id: idRes.id,
      name: body.name,
      description: body.description,
      category: tax.categorySlug,
      billing: tax.billingSlug,
      brand_id: brandId,
      price_from: priceStored,
      featured: body.featured,
      rating: body.rating,
      review_count: body.review_count,
      top_review: body.top_review?.trim() || null,
      seats: body.seats?.trim() || null,
      is_active: body.is_active,
      catalog_category_id: body.catalog_category_id,
      catalog_subcategory_id: body.catalog_subcategory_id,
      slug: body.slug && body.slug.trim() ? body.slug.trim().toLowerCase() : null,
      long_description: body.long_description?.trim() || null,
      meta_title: body.meta_title?.trim() || null,
      meta_description: body.meta_description?.trim() || null,
      meta_keywords: body.meta_keywords?.trim() || null,
      og_image_url: body.og_image_url ?? null,
      robots: body.robots?.trim() || null,
      checkout_field_label: body.checkout_field_label?.trim() || null,
      icon_key: iconKey,
      faqs: body.faqs ?? [],
      features: body.features ?? [],
      top_features: body.top_features ?? [],
      quantity_options: qtyOpts,
    };

    const { data, error } = await supabase.from("premium_products").insert(insert).select("*").single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...rest } = parsed.data;
    if (Object.keys(rest).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (rest.name !== undefined) patch.name = rest.name;
    if (rest.description !== undefined) patch.description = rest.description;
    if (rest.featured !== undefined) patch.featured = rest.featured;
    if (rest.rating !== undefined) patch.rating = rest.rating;
    if (rest.review_count !== undefined) patch.review_count = rest.review_count;
    if (rest.top_review !== undefined) patch.top_review = rest.top_review?.trim() || null;
    if (rest.seats !== undefined) patch.seats = rest.seats?.trim() || null;
    if (rest.is_active !== undefined) patch.is_active = rest.is_active;

    if (rest.slug !== undefined) {
      patch.slug =
        rest.slug && typeof rest.slug === "string" && rest.slug.trim()
          ? rest.slug.trim().toLowerCase()
          : null;
    }
    if (rest.long_description !== undefined) patch.long_description = rest.long_description?.trim() || null;
    if (rest.meta_title !== undefined) patch.meta_title = rest.meta_title?.trim() || null;
    if (rest.meta_description !== undefined) patch.meta_description = rest.meta_description?.trim() || null;
    if (rest.meta_keywords !== undefined) patch.meta_keywords = rest.meta_keywords?.trim() || null;
    if (rest.og_image_url !== undefined) patch.og_image_url = rest.og_image_url;
    if (rest.robots !== undefined) patch.robots = rest.robots?.trim() || null;
    if (rest.checkout_field_label !== undefined) {
      patch.checkout_field_label = rest.checkout_field_label?.trim() || null;
    }
    if (rest.faqs !== undefined) patch.faqs = rest.faqs;
    if (rest.features !== undefined) patch.features = rest.features;
    if (rest.top_features !== undefined) patch.top_features = rest.top_features;
    if (rest.quantity_options !== undefined) patch.quantity_options = rest.quantity_options;

    if (rest.icon_key !== undefined) {
      const ik = rest.icon_key?.trim() || null;
      patch.icon_key = ik;
      patch.brand_id = brandIdFromPremiumIconKey(ik);
    }

    const catId = rest.catalog_category_id;
    const subId = rest.catalog_subcategory_id;
    if (catId !== undefined || subId !== undefined) {
      if (catId === undefined || subId === undefined) {
        return NextResponse.json(
          { error: "catalog_category_id and catalog_subcategory_id must be updated together" },
          { status: 400 }
        );
      }
      const tax = await resolvePremiumTaxonomy(supabase, catId, subId);
      if ("error" in tax) {
        return NextResponse.json({ error: tax.error }, { status: 400 });
      }
      patch.catalog_category_id = catId;
      patch.catalog_subcategory_id = subId;
      patch.category = tax.categorySlug;
      patch.billing = tax.billingSlug;
    }

    if (rest.price_from !== undefined || rest.quantity_options !== undefined) {
      const { data: existing } = await supabase
        .from("premium_products")
        .select("price_from, quantity_options")
        .eq("id", id)
        .maybeSingle();
      const prevPrice = Number((existing as { price_from?: number } | null)?.price_from ?? 0);
      const prevTiers = Array.isArray((existing as { quantity_options?: unknown } | null)?.quantity_options)
        ? ((existing as { quantity_options: { price: number }[] }).quantity_options)
        : [];
      const nextPrice = rest.price_from ?? prevPrice;
      const nextTiers =
        rest.quantity_options !== undefined ? rest.quantity_options : prevTiers;
      patch.price_from = resolvedPriceFrom(nextPrice, nextTiers);
    }

    const { data, error } = await supabase
      .from("premium_products")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = bulkDeleteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("premium_products").delete().in("id", parsed.data.ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, deleted: parsed.data.ids.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
