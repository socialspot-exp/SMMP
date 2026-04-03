"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import type { PremiumCatalogCategoryDTO } from "@/lib/premium-catalog-api";
import type { PremiumProductRow } from "@/lib/premium-products-api";
import { formatAdminApiError, readAdminResponseJson } from "@/lib/admin-response-json";
import {
  PREMIUM_ICON_SELECT_GROUPS,
  PremiumCatalogIcon,
  isPremiumCatalogIconKey,
  type PremiumCatalogIconKey,
} from "@/lib/premium-catalog-icons";
import { cn } from "@/lib/utils";

export type AdminPremiumProductFormProps = {
  className?: string;
  categories: PremiumCatalogCategoryDTO[];
  mode: "create" | "edit";
  initial: PremiumProductRow | null;
  onClose: () => void;
  onSaved: () => void;
};

function slugifyPremiumLabel(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return s.length > 0 ? s : "premium-product";
}

type FormState = {
  catalog_category_id: string;
  catalog_subcategory_id: string;
  icon_key: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  price_from: string;
  featured: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image_url: string;
  robots: string;
  checkout_field_label: string;
  is_active: boolean;
  faqs: { q: string; a: string }[];
  top_features: { icon_key: string; title: string; description: string }[];
  qty_tiers: {
    qty: string;
    price: string;
    badge: string;
    subtitle: string;
    compare_at: string;
    popular: boolean;
  }[];
};

function rowToForm(row: PremiumProductRow): FormState {
  const ik =
    row.icon_key && String(row.icon_key).trim()
      ? isPremiumCatalogIconKey(String(row.icon_key))
        ? String(row.icon_key)
        : "Sparkles"
      : "Sparkles";
  return {
    catalog_category_id: row.catalog_category_id ?? "",
    catalog_subcategory_id: row.catalog_subcategory_id ?? "",
    icon_key: ik,
    name: row.name,
    slug: row.slug ?? "",
    description: row.description,
    long_description: row.long_description ?? "",
    price_from: String(row.price_from),
    featured: row.featured,
    meta_title: row.meta_title ?? "",
    meta_description: row.meta_description ?? "",
    meta_keywords: row.meta_keywords ?? "",
    og_image_url: row.og_image_url ?? "",
    robots: row.robots ?? "",
    checkout_field_label: row.checkout_field_label ?? "",
    is_active: row.is_active,
    faqs: row.faqs.length > 0 ? row.faqs.map((x) => ({ q: x.q, a: x.a })) : [],
    top_features:
      row.top_features?.length
        ? row.top_features.map((x) => ({
            icon_key: x.iconKey,
            title: x.title,
            description: x.description,
          }))
        : [],
    qty_tiers:
      row.quantity_options.length > 0
        ? row.quantity_options.map((x) => ({
            qty: String(x.qty),
            price: String(x.price),
            badge: x.badge ?? "",
            subtitle: x.subtitle ?? "",
            compare_at: x.compareAt != null ? String(x.compareAt) : "",
            popular: x.popular === true,
          }))
        : [],
  };
}

function defaultCategoryIds(tree: PremiumCatalogCategoryDTO[]) {
  const c = tree.find((x) => x.is_active) ?? tree[0];
  if (!c) return { catalog_category_id: "", catalog_subcategory_id: "" };
  const subs = c.subcategories.filter((s) => s.is_active);
  const s = subs[0] ?? c.subcategories[0];
  return {
    catalog_category_id: c.id,
    catalog_subcategory_id: s?.id ?? "",
  };
}

const emptyFormStatic: FormState = {
  catalog_category_id: "",
  catalog_subcategory_id: "",
  icon_key: "Sparkles",
  name: "",
  slug: "",
  description: "",
  long_description: "",
  price_from: "9.99",
  featured: false,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_image_url: "",
  robots: "index,follow",
  checkout_field_label: "",
  is_active: true,
  faqs: [],
  top_features: [],
  qty_tiers: [],
};

export function AdminPremiumProductForm({
  className,
  categories,
  mode,
  initial,
  onClose,
  onSaved,
}: AdminPremiumProductFormProps) {
  const defaults = useMemo(() => defaultCategoryIds(categories), [categories]);

  const [f, setF] = useState<FormState>(() => {
    if (mode === "edit" && initial) return rowToForm(initial);
    return { ...emptyFormStatic, ...defaults };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setF(rowToForm(initial));
    } else {
      setF({ ...emptyFormStatic, ...defaultCategoryIds(categories) });
    }
  }, [mode, initial, categories]);

  const selectedCat = useMemo(
    () => categories.find((c) => c.id === f.catalog_category_id),
    [categories, f.catalog_category_id]
  );

  const subOptions = useMemo(() => {
    const subs = selectedCat?.subcategories ?? [];
    return subs.filter((s) => s.is_active);
  }, [selectedCat]);

  const iconPreviewKey: PremiumCatalogIconKey = isPremiumCatalogIconKey(f.icon_key)
    ? f.icon_key
    : "Sparkles";

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
  };

  const onCategoryChange = useCallback(
    (categoryId: string) => {
      const cat = categories.find((c) => c.id === categoryId);
      const subs = cat?.subcategories.filter((s) => s.is_active) ?? cat?.subcategories ?? [];
      const firstSub = subs[0]?.id ?? "";
      setF((prev) => ({
        ...prev,
        catalog_category_id: categoryId,
        catalog_subcategory_id: firstSub,
      }));
    },
    [categories]
  );

  const fieldClass =
    "w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface";

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const price_from = Number.parseFloat(f.price_from);
      if (!f.name.trim()) {
        setError("Name is required");
        return;
      }
      if (!f.description.trim()) {
        setError("Short description is required");
        return;
      }
      if (!f.catalog_category_id || !f.catalog_subcategory_id) {
        setError("Select category and subcategory");
        return;
      }
      if (!Number.isFinite(price_from) || price_from < 0) {
        setError("Invalid price (use “Price from” when you have no package tiers, or set tier prices)");
        return;
      }

      const quantity_options: {
        qty: number;
        price: number;
        badge?: string;
        subtitle?: string;
        compareAt?: number;
        popular?: boolean;
      }[] = [];
      for (const row of f.qty_tiers) {
        const qtyS = row.qty.trim();
        const priceS = row.price.trim();
        if (!qtyS && !priceS) continue;
        const qty = Number.parseInt(qtyS, 10);
        const price = Number.parseFloat(priceS);
        if (!Number.isFinite(qty) || qty < 1) {
          setError("Packages: each row needs a valid quantity (e.g. months or billing units).");
          return;
        }
        if (!Number.isFinite(price) || price < 0) {
          setError("Packages: each row needs a valid price.");
          return;
        }
        const o: (typeof quantity_options)[number] = { qty, price };
        if (row.badge.trim()) o.badge = row.badge.trim();
        if (row.subtitle.trim()) o.subtitle = row.subtitle.trim();
        if (row.compare_at.trim() !== "") {
          const c = Number.parseFloat(row.compare_at);
          if (Number.isFinite(c) && c >= 0) o.compareAt = c;
        }
        if (row.popular) o.popular = true;
        quantity_options.push(o);
      }
      if (quantity_options.length > 12) {
        setError("Maximum 12 package tiers.");
        return;
      }

      const faqsPayload = f.faqs
        .map((x) => ({ q: x.q.trim(), a: x.a.trim() }))
        .filter((x) => x.q.length > 0 && x.a.length > 0);

      const topFeaturesPayload = f.top_features
        .map((x) => ({
          icon_key: x.icon_key.trim(),
          title: x.title.trim(),
          description: x.description.trim(),
        }))
        .filter((x) => x.icon_key.length > 0 && x.title.length > 0 && x.description.length > 0);
      if (topFeaturesPayload.length > 12) {
        setError("Maximum 12 top features.");
        return;
      }

      const iconRaw = f.icon_key.trim();
      const icon_key = iconRaw && isPremiumCatalogIconKey(iconRaw) ? iconRaw : null;

      const legacy =
        mode === "edit" && initial
          ? {
              rating: initial.rating,
              review_count: initial.review_count,
              top_review: initial.top_review,
              seats: initial.seats,
            }
          : {
              rating: 4.8,
              review_count: 100,
              top_review: null as string | null,
              seats: null as string | null,
            };

      const body = {
        name: f.name.trim(),
        description: f.description.trim(),
        catalog_category_id: f.catalog_category_id,
        catalog_subcategory_id: f.catalog_subcategory_id,
        icon_key,
        slug: f.slug.trim().toLowerCase() || null,
        long_description: f.long_description.trim() || null,
        meta_title: f.meta_title.trim() || null,
        meta_description: f.meta_description.trim() || null,
        meta_keywords: f.meta_keywords.trim() || null,
        og_image_url: f.og_image_url.trim() || null,
        robots: f.robots.trim() || null,
        checkout_field_label: f.checkout_field_label.trim() || null,
        price_from,
        featured: f.featured,
        rating: legacy.rating,
        review_count: legacy.review_count,
        top_review: legacy.top_review,
        seats: legacy.seats,
        is_active: f.is_active,
        faqs: faqsPayload,
        top_features: topFeaturesPayload,
        quantity_options,
      };

      const res = await fetch("/api/admin/premium-products", {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" && initial ? { id: initial.id, ...body } : body),
      });
      const { data, notJsonMessage } = await readAdminResponseJson(res);
      if (notJsonMessage) {
        setError(notJsonMessage);
        return;
      }
      if (!res.ok) {
        setError(formatAdminApiError(data));
        return;
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col border-l border-outline-variant/15 bg-surface-container-lowest shadow-xl",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/10 p-4">
        <div>
          <p className="font-headline text-lg font-extrabold text-on-surface">
            {mode === "create" ? "Add premium product" : "Edit premium product"}
          </p>
          <p className="text-xs text-on-surface-variant">
            Catalog category sets storefront routing; icon drives brand mark when mapped.
          </p>
          {mode === "edit" && initial ? (
            <p className="mt-0.5 font-mono text-xs text-on-surface-variant">{initial.id}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Close"
        >
          <X className="size-5 stroke-[1.75]" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm break-words whitespace-pre-wrap text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Category &amp; subcategory
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Category
              </label>
              <select
                value={f.catalog_category_id}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={fieldClass}
              >
                {categories.length === 0 ? (
                  <option value="">No categories — add in Premium catalog</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Subcategory / offer
              </label>
              <select
                value={f.catalog_subcategory_id}
                onChange={(e) => setField("catalog_subcategory_id", e.target.value)}
                disabled={subOptions.length === 0}
                className={cn(fieldClass, subOptions.length === 0 && "opacity-50")}
              >
                {subOptions.length === 0 ? (
                  <option value="">Add subcategories under this category</option>
                ) : (
                  subOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.slug})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Select icon
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-low">
              <PremiumCatalogIcon name={iconPreviewKey} className="size-8 text-primary" />
            </div>
            <select
              value={isPremiumCatalogIconKey(f.icon_key) ? f.icon_key : "Sparkles"}
              onChange={(e) => setField("icon_key", e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-xs font-semibold"
            >
              {PREMIUM_ICON_SELECT_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.keys.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">Core</p>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Name
            </label>
            <input
              value={f.name}
              onChange={(e) => setField("name", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Slug
              </label>
              <input
                value={f.slug}
                onChange={(e) => setField("slug", e.target.value)}
                className={cn(fieldClass, "font-mono text-xs")}
                placeholder="netflix-standard-1m"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setField("slug", slugifyPremiumLabel(f.name))}
                className="rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface"
              >
                From name
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Short description
            </label>
            <textarea
              value={f.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Long description
            </label>
            <textarea
              value={f.long_description}
              onChange={(e) => setField("long_description", e.target.value)}
              rows={5}
              className={fieldClass}
              placeholder="Extended copy for the product page (plain text)."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Price from (USD)
            </label>
            <input
              value={f.price_from}
              onChange={(e) => setField("price_from", e.target.value)}
              inputMode="decimal"
              className={fieldClass}
            />
            <p className="mt-1 text-[11px] text-on-surface-variant">
              Storing the minimum of package prices when tiers exist; otherwise this is the list price.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <input
              type="checkbox"
              checked={f.featured}
              onChange={(e) => setField("featured", e.target.checked)}
              className="size-4 rounded border-outline-variant"
            />
            Featured on services grid
          </label>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Storefront — packages &amp; checkout field
          </p>
          <p className="text-xs text-on-surface-variant">
            Leave tiers empty to use default duration options from the product category. When you add
            rows, the product page uses only these quantities (e.g. 1 / 3 / 12 months) and prices.
          </p>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Checkout helper label (optional)
            </label>
            <input
              value={f.checkout_field_label}
              onChange={(e) => setField("checkout_field_label", e.target.value)}
              className={fieldClass}
              placeholder='e.g. "Account email for delivery"'
            />
          </div>
          <div className="space-y-3">
            {f.qty_tiers.map((tier, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-lg border border-outline-variant/15 bg-surface-container-low/30 p-3 sm:grid-cols-2"
              >
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                    Package {i + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
                      <input
                        type="checkbox"
                        checked={tier.popular}
                        onChange={(e) => {
                          const on = e.target.checked;
                          setF((prev) => ({
                            ...prev,
                            qty_tiers: prev.qty_tiers.map((r, j) =>
                              j === i ? { ...r, popular: on } : on ? { ...r, popular: false } : r
                            ),
                          }));
                        }}
                        className="size-4 rounded border-outline-variant"
                      />
                      Default selection
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setF((prev) => ({
                          ...prev,
                          qty_tiers: prev.qty_tiers.filter((_, j) => j !== i),
                        }))
                      }
                      className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-red-600"
                      aria-label={`Remove package ${i + 1}`}
                    >
                      <Trash2 className="size-4 stroke-[1.75]" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Quantity / months
                  </label>
                  <input
                    value={tier.qty}
                    onChange={(e) =>
                      setF((prev) => {
                        const next = [...prev.qty_tiers];
                        const cur = next[i];
                        if (cur) next[i] = { ...cur, qty: e.target.value };
                        return { ...prev, qty_tiers: next };
                      })
                    }
                    className={cn(fieldClass, "font-mono text-xs")}
                    inputMode="numeric"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Price (USD)
                  </label>
                  <input
                    value={tier.price}
                    onChange={(e) =>
                      setF((prev) => {
                        const next = [...prev.qty_tiers];
                        const cur = next[i];
                        if (cur) next[i] = { ...cur, price: e.target.value };
                        return { ...prev, qty_tiers: next };
                      })
                    }
                    className={cn(fieldClass, "font-mono text-xs")}
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Badge (optional)
                  </label>
                  <input
                    value={tier.badge}
                    onChange={(e) =>
                      setF((prev) => {
                        const next = [...prev.qty_tiers];
                        const cur = next[i];
                        if (cur) next[i] = { ...cur, badge: e.target.value };
                        return { ...prev, qty_tiers: next };
                      })
                    }
                    className={fieldClass}
                    placeholder="Best value"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Compare-at (optional)
                  </label>
                  <input
                    value={tier.compare_at}
                    onChange={(e) =>
                      setF((prev) => {
                        const next = [...prev.qty_tiers];
                        const cur = next[i];
                        if (cur) next[i] = { ...cur, compare_at: e.target.value };
                        return { ...prev, qty_tiers: next };
                      })
                    }
                    className={cn(fieldClass, "font-mono text-xs")}
                    inputMode="decimal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Subtitle (optional)
                  </label>
                  <input
                    value={tier.subtitle}
                    onChange={(e) =>
                      setF((prev) => {
                        const next = [...prev.qty_tiers];
                        const cur = next[i];
                        if (cur) next[i] = { ...cur, subtitle: e.target.value };
                        return { ...prev, qty_tiers: next };
                      })
                    }
                    className={fieldClass}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setF((prev) => ({
                ...prev,
                qty_tiers: [
                  ...prev.qty_tiers,
                  {
                    qty: "",
                    price: "",
                    badge: "",
                    subtitle: "",
                    compare_at: "",
                    popular: false,
                  },
                ],
              }))
            }
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            Add package tier
          </button>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            SEO &amp; social
          </p>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Meta title
            </label>
            <input
              value={f.meta_title}
              onChange={(e) => setField("meta_title", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Meta description
            </label>
            <textarea
              value={f.meta_description}
              onChange={(e) => setField("meta_description", e.target.value)}
              rows={2}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Meta keywords
            </label>
            <input
              value={f.meta_keywords}
              onChange={(e) => setField("meta_keywords", e.target.value)}
              className={fieldClass}
              placeholder="comma, separated"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              OG / hero image URL
            </label>
            <input
              value={f.og_image_url}
              onChange={(e) => setField("og_image_url", e.target.value)}
              className={fieldClass}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Robots
            </label>
            <input
              value={f.robots}
              onChange={(e) => setField("robots", e.target.value)}
              className={fieldClass}
              placeholder="index,follow"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Top Features
          </p>
          <p className="text-xs text-on-surface-variant">
            Add the icon, title, and short description that appear in the premium product “Top Features” section.
          </p>
          <div className="space-y-3">
            {f.top_features.map((tf, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-lg border border-outline-variant/15 bg-surface-container-low/30 p-3 sm:grid-cols-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface">
                    <PremiumCatalogIcon
                      name={tf.icon_key}
                      className="size-5 stroke-[1.75] text-primary"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                      Icon
                    </label>
                    <select
                      value={tf.icon_key}
                      onChange={(e) => {
                        const v = e.target.value;
                        setF((prev) => ({
                          ...prev,
                          top_features: prev.top_features.map((row, j) =>
                            j === i ? { ...row, icon_key: v } : row
                          ),
                        }));
                      }}
                      className={cn(fieldClass, "py-2")}
                    >
                      {PREMIUM_ICON_SELECT_GROUPS.map((g) => (
                        <optgroup key={g.label} label={g.label}>
                          {g.keys.map((id) => (
                            <option key={id} value={id}>
                              {id}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Feature title
                  </label>
                  <input
                    value={tf.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setF((prev) => ({
                        ...prev,
                        top_features: prev.top_features.map((row, j) =>
                          j === i ? { ...row, title: v } : row
                        ),
                      }));
                    }}
                    className={cn(fieldClass, "font-semibold")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Description
                  </label>
                  <textarea
                    value={tf.description}
                    onChange={(e) => {
                      const v = e.target.value;
                      setF((prev) => ({
                        ...prev,
                        top_features: prev.top_features.map((row, j) =>
                          j === i ? { ...row, description: v } : row
                        ),
                      }));
                    }}
                    rows={3}
                    className={fieldClass}
                    placeholder="e.g. Invite links arrive instantly after checkout."
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() =>
                      setF((prev) => ({
                        ...prev,
                        top_features: prev.top_features.filter((_, j) => j !== i),
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface hover:text-red-600"
                  >
                    <Trash2 className="size-4 stroke-[1.75]" aria-hidden />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setF((prev) => ({
                ...prev,
                top_features: [
                  ...prev.top_features,
                  { icon_key: "Sparkles", title: "", description: "" },
                ],
              }))
            }
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            Add top feature
          </button>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Product FAQs
          </p>
          <div className="space-y-3">
            {f.faqs.map((item, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border border-outline-variant/15 bg-surface-container-low/30 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                    FAQ {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setF((prev) => ({
                        ...prev,
                        faqs: prev.faqs.filter((_, j) => j !== i),
                      }))
                    }
                    className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-red-600"
                    aria-label={`Remove FAQ ${i + 1}`}
                  >
                    <Trash2 className="size-4 stroke-[1.75]" />
                  </button>
                </div>
                <input
                  value={item.q}
                  onChange={(e) =>
                    setF((prev) => {
                      const next = [...prev.faqs];
                      const cur = next[i];
                      if (cur) next[i] = { ...cur, q: e.target.value };
                      return { ...prev, faqs: next };
                    })
                  }
                  className={fieldClass}
                  placeholder="Question"
                />
                <textarea
                  value={item.a}
                  onChange={(e) =>
                    setF((prev) => {
                      const next = [...prev.faqs];
                      const cur = next[i];
                      if (cur) next[i] = { ...cur, a: e.target.value };
                      return { ...prev, faqs: next };
                    })
                  }
                  rows={3}
                  className={fieldClass}
                  placeholder="Answer"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setF((prev) => ({ ...prev, faqs: [...prev.faqs, { q: "", a: "" }] }))
            }
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            Add FAQ
          </button>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">Status</p>
          <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <input
              type="checkbox"
              checked={f.is_active}
              onChange={(e) => setField("is_active", e.target.checked)}
              className="size-4 rounded border-outline-variant"
            />
            Active (visible on storefront when Supabase catalog is used)
          </label>
        </section>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 border-t border-outline-variant/10 p-4">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving || categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {saving ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-outline-variant/25 px-5 py-2.5 text-sm font-bold text-on-surface"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
