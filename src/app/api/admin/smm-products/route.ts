import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import {
  fetchSmmProductsAdmin,
  nextSmmProductId,
  type SmmProductFaq,
  type SmmProductQtyOptionRow,
  type SmmProductRow,
} from "@/lib/smm-products-api";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const durationEnum = z.enum(["instant", "24h", "7d", "14d"]);

const slugRe = /^[a-z0-9][a-z0-9-]{0,100}$/;

const ogSchema = z
  .union([z.string().url().max(2000), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v));

const faqItemSchema = z.object({
  q: z.string().min(1).max(500),
  a: z.string().min(1).max(8000),
});

const smmQtyOptionSchema = z.object({
  qty: z.number().int().min(1).max(2_147_483_647),
  price: z.number().nonnegative().max(1_000_000),
  badge: z.string().max(40).optional().nullable(),
  subtitle: z.string().max(300).optional().nullable(),
  compareAt: z.number().nonnegative().max(1_000_000).optional().nullable(),
  popular: z.boolean().optional(),
});

/** Plain object only — Zod forbids `.partial()` on schemas that already use `.superRefine()`. */
const productBodyObject = z.object({
  name: z.string().min(1).max(500),
  description: z.string().min(1).max(8000),
  slug: z.string().min(1).max(102).regex(slugRe),
  platform_id: z.string().uuid(),
  subcategory_id: z.string().uuid(),
  price_from: z.number().nonnegative().max(1_000_000),
  duration: durationEnum,
  featured: z.boolean().optional().default(false),
  rating: z.number().min(0).max(5),
  review_count: z.number().int().nonnegative().max(50_000_000),
  top_review: z.string().max(2000).optional().nullable(),
  long_description: z.string().max(20000).optional().nullable(),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
  meta_keywords: z.string().max(500).optional().nullable(),
  og_image_url: ogSchema,
  robots: z.string().max(200).optional().nullable(),
  is_active: z.boolean().optional().default(true),
  panel_api_id: z.string().uuid().nullable().optional(),
  panel_service_id: z.string().max(64).nullable().optional(),
  order_qty_min: z.number().int().min(0).max(2_147_483_647).nullable().optional(),
  order_qty_max: z.number().int().min(0).max(2_147_483_647).nullable().optional(),
  faqs: z.array(faqItemSchema).max(50).optional(),
  quantity_options: z.array(smmQtyOptionSchema).max(12).optional(),
  checkout_field_label: z.string().max(200).optional().nullable(),
  features: z.array(z.string().min(1).max(300)).max(30).optional(),
});

function refineOrderQtyRange(
  data: { order_qty_min?: number | null; order_qty_max?: number | null },
  ctx: z.RefinementCtx
) {
  if (
    data.order_qty_min != null &&
    data.order_qty_max != null &&
    data.order_qty_min > data.order_qty_max
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "order_qty_min must be <= order_qty_max",
      path: ["order_qty_max"],
    });
  }
}

const productBodyBase = productBodyObject.superRefine(refineOrderQtyRange);

const patchSchema = productBodyObject
  .partial()
  .extend({
    id: z.string().regex(/^S[0-9]{3}$/),
  })
  .superRefine(refineOrderQtyRange);

async function resolveTaxonomy(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  platform_id: string,
  subcategory_id: string
): Promise<{ platformSlug: string; categorySlug: string } | { error: string }> {
  const { data: sub, error: e1 } = await supabase
    .from("smm_subcategories")
    .select("id, platform_id, slug")
    .eq("id", subcategory_id)
    .maybeSingle();

  if (e1 || !sub) return { error: "Invalid subcategory_id" };
  if (sub.platform_id !== platform_id) {
    return { error: "Subcategory does not belong to the selected platform" };
  }

  const { data: plat, error: e2 } = await supabase
    .from("smm_platforms")
    .select("slug")
    .eq("id", platform_id)
    .maybeSingle();

  if (e2 || !plat?.slug) return { error: "Invalid platform_id" };

  return { platformSlug: plat.slug, categorySlug: sub.slug };
}

/** Plain JSON-serializable object (avoid spread leaking non-JSON types from Supabase). */
function rowToJson(row: SmmProductRow) {
  const faqs: SmmProductFaq[] = Array.isArray(row.faqs)
    ? row.faqs.map((x) => ({ q: String(x.q), a: String(x.a) }))
    : [];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    platform: row.platform,
    category: row.category,
    price_from: row.price_from,
    duration: row.duration,
    featured: row.featured,
    rating: row.rating,
    review_count: row.review_count,
    top_review: row.top_review,
    is_active: row.is_active,
    platform_id: row.platform_id,
    subcategory_id: row.subcategory_id,
    slug: row.slug,
    long_description: row.long_description,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    meta_keywords: row.meta_keywords,
    og_image_url: row.og_image_url,
    robots: row.robots,
    panel_api_id: row.panel_api_id,
    panel_service_id: row.panel_service_id,
    order_qty_min: row.order_qty_min,
    order_qty_max: row.order_qty_max,
    faqs,
    quantity_options: row.quantity_options.map((x: SmmProductQtyOptionRow) => ({
      qty: x.qty,
      price: x.price,
      badge: x.badge,
      subtitle: x.subtitle,
      compareAt: x.compareAt,
      popular: x.popular === true ? true : undefined,
    })),
    checkout_field_label: row.checkout_field_label,
    features: Array.isArray(row.features) ? row.features.map((x) => String(x)) : [],
  };
}

export async function GET() {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const res = await fetchSmmProductsAdmin();
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    const products = res.rows.map(rowToJson);
    try {
      JSON.stringify(products);
    } catch (ser) {
      const msg = ser instanceof Error ? ser.message : "Serialization error";
      return NextResponse.json(
        { error: `Could not serialize products for response: ${msg}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ products });
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

    const parsed = productBodyBase.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    if (body.panel_service_id && !body.panel_api_id) {
      return NextResponse.json(
        { error: "panel_api_id is required when panel_service_id is set" },
        { status: 400 }
      );
    }

    const tax = await resolveTaxonomy(supabase, body.platform_id, body.subcategory_id);
    if ("error" in tax) {
      return NextResponse.json({ error: tax.error }, { status: 400 });
    }

    const idRes = await nextSmmProductId();
    if (!idRes.ok) {
      return NextResponse.json({ error: idRes.error }, { status: 400 });
    }

    const insert = {
      id: idRes.id,
      name: body.name,
      description: body.description,
      slug: body.slug,
      platform: tax.platformSlug,
      category: tax.categorySlug,
      platform_id: body.platform_id,
      subcategory_id: body.subcategory_id,
      price_from: body.price_from,
      duration: body.duration,
      featured: body.featured,
      rating: body.rating,
      review_count: body.review_count,
      top_review: body.top_review ?? null,
      long_description: body.long_description ?? null,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
      meta_keywords: body.meta_keywords ?? null,
      og_image_url: body.og_image_url ?? null,
      robots: body.robots ?? null,
      is_active: body.is_active,
      panel_api_id: body.panel_api_id ?? null,
      panel_service_id: body.panel_service_id?.trim() || null,
      order_qty_min: body.order_qty_min ?? null,
      order_qty_max: body.order_qty_max ?? null,
      faqs: body.faqs ?? [],
      quantity_options: body.quantity_options ?? [],
      checkout_field_label: body.checkout_field_label?.trim() || null,
      features: body.features ?? [],
    };

    const { data, error } = await supabase.from("smm_products").insert(insert).select("*").single();

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
  if (rest.slug !== undefined) patch.slug = rest.slug;
  if (rest.price_from !== undefined) patch.price_from = rest.price_from;
  if (rest.duration !== undefined) patch.duration = rest.duration;
  if (rest.featured !== undefined) patch.featured = rest.featured;
  if (rest.rating !== undefined) patch.rating = rest.rating;
  if (rest.review_count !== undefined) patch.review_count = rest.review_count;
  if (rest.top_review !== undefined) patch.top_review = rest.top_review;
  if (rest.long_description !== undefined) patch.long_description = rest.long_description;
  if (rest.meta_title !== undefined) patch.meta_title = rest.meta_title;
  if (rest.meta_description !== undefined) patch.meta_description = rest.meta_description;
  if (rest.meta_keywords !== undefined) patch.meta_keywords = rest.meta_keywords;
  if (rest.og_image_url !== undefined) patch.og_image_url = rest.og_image_url;
  if (rest.robots !== undefined) patch.robots = rest.robots;
  if (rest.is_active !== undefined) patch.is_active = rest.is_active;
  if (rest.order_qty_min !== undefined) patch.order_qty_min = rest.order_qty_min;
  if (rest.order_qty_max !== undefined) patch.order_qty_max = rest.order_qty_max;
  if (rest.faqs !== undefined) patch.faqs = rest.faqs;
  if (rest.quantity_options !== undefined) patch.quantity_options = rest.quantity_options;
  if (rest.checkout_field_label !== undefined) {
    patch.checkout_field_label = rest.checkout_field_label?.trim() || null;
  }
  if (rest.features !== undefined) patch.features = rest.features;

  if (rest.panel_api_id !== undefined) {
    patch.panel_api_id = rest.panel_api_id;
    if (rest.panel_api_id === null) {
      patch.panel_service_id = null;
    }
  }

  if (rest.panel_service_id !== undefined) {
    const svc = rest.panel_service_id?.trim() || null;
    if (rest.panel_api_id === null && svc) {
      return NextResponse.json(
        { error: "Cannot set panel_service_id when clearing panel" },
        { status: 400 }
      );
    }
    if (svc) {
      let hasPanel = rest.panel_api_id != null;
      if (rest.panel_api_id === undefined) {
        const { data: existing } = await supabase
          .from("smm_products")
          .select("panel_api_id")
          .eq("id", id)
          .maybeSingle();
        hasPanel = Boolean((existing as { panel_api_id: string | null } | null)?.panel_api_id);
      }
      if (!hasPanel) {
        return NextResponse.json(
          { error: "Set panel_api_id before panel_service_id" },
          { status: 400 }
        );
      }
    }
    patch.panel_service_id = svc;
  }

  if (rest.platform_id !== undefined && rest.subcategory_id !== undefined) {
    const tax = await resolveTaxonomy(supabase, rest.platform_id, rest.subcategory_id);
    if ("error" in tax) {
      return NextResponse.json({ error: tax.error }, { status: 400 });
    }
    patch.platform_id = rest.platform_id;
    patch.subcategory_id = rest.subcategory_id;
    patch.platform = tax.platformSlug;
    patch.category = tax.categorySlug;
  } else if (rest.platform_id !== undefined || rest.subcategory_id !== undefined) {
    return NextResponse.json(
      { error: "platform_id and subcategory_id must be updated together" },
      { status: 400 }
    );
  }

    const { data, error } = await supabase
      .from("smm_products")
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

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().regex(/^S[0-9]{3}$/)).min(1).max(200),
});

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

    const { error } = await supabase.from("smm_products").delete().in("id", parsed.data.ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, deleted: parsed.data.ids.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
