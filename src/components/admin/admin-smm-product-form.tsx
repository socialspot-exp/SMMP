"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { SocialBrandIcon, isSocialPlatformId } from "@/components/home/social-brand";
import type { SmmPlatformDTO } from "@/lib/smm-catalog-api";
import type { SmmProductRow } from "@/lib/smm-products-api";
import { formatAdminApiError, readAdminResponseJson } from "@/lib/admin-response-json";
import { slugifySmmProductLabel } from "@/lib/smm-product-helpers";
import { SMM_DURATIONS } from "@/lib/services-data";
import { cn } from "@/lib/utils";

export type AdminSmmProductFormProps = {
  className?: string;
  platforms: SmmPlatformDTO[];
  mode: "create" | "edit";
  initial: SmmProductRow | null;
  onClose: () => void;
  onSaved: () => void;
};

function parsePanelQtyToFormString(raw: string | null | undefined): string {
  if (raw == null || String(raw).trim() === "") return "";
  const cleaned = String(raw).replace(/,/g, "").replace(/\s/g, "").trim();
  if (!cleaned) return "";
  const n = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(Math.min(n, 2_147_483_647));
}

function rowToFormState(row: SmmProductRow) {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description,
    platform_id: row.platform_id ?? "",
    subcategory_id: row.subcategory_id ?? "",
    price_from: String(row.price_from),
    duration: row.duration,
    featured: row.featured,
    rating: String(row.rating),
    review_count: String(row.review_count),
    top_review: row.top_review ?? "",
    long_description: row.long_description ?? "",
    meta_title: row.meta_title ?? "",
    meta_description: row.meta_description ?? "",
    meta_keywords: row.meta_keywords ?? "",
    og_image_url: row.og_image_url ?? "",
    robots: row.robots ?? "",
    is_active: row.is_active,
    panel_api_id: row.panel_api_id ?? "",
    panel_service_id: row.panel_service_id ?? "",
    order_qty_min: row.order_qty_min != null ? String(row.order_qty_min) : "",
    order_qty_max: row.order_qty_max != null ? String(row.order_qty_max) : "",
    faqs: row.faqs.length > 0 ? row.faqs.map((x) => ({ q: x.q, a: x.a })) : [],
    features: row.features?.length ? [...row.features] : [],
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
    checkout_field_label: row.checkout_field_label ?? "",
  };
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  platform_id: "",
  subcategory_id: "",
  price_from: "4.99",
  duration: "24h",
  featured: false,
  rating: "4.8",
  review_count: "100",
  top_review: "",
  long_description: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_image_url: "",
  robots: "index,follow",
  is_active: true,
  panel_api_id: "",
  panel_service_id: "",
  order_qty_min: "",
  order_qty_max: "",
  faqs: [] as { q: string; a: string }[],
  features: [] as string[],
  qty_tiers: [] as {
    qty: string;
    price: string;
    badge: string;
    subtitle: string;
    compare_at: string;
    popular: boolean;
  }[],
  checkout_field_label: "",
};

type PanelApiListItem = { id: string; label: string };

type PanelServiceItem = {
  id: string;
  name: string;
  category: string | null;
  type: string | null;
  rate: string | null;
  min: string | null;
  max: string | null;
};

export function AdminSmmProductForm({
  className,
  platforms,
  mode,
  initial,
  onClose,
  onSaved,
}: AdminSmmProductFormProps) {
  const [f, setF] = useState(() =>
    mode === "edit" && initial ? rowToFormState(initial) : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panels, setPanels] = useState<PanelApiListItem[]>([]);
  const [panelServices, setPanelServices] = useState<PanelServiceItem[]>([]);
  const [loadingPanels, setLoadingPanels] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const loadPanels = useCallback(async () => {
    setLoadingPanels(true);
    try {
      const res = await fetch("/api/admin/panel-apis", { credentials: "include" });
      const { data, notJsonMessage } = await readAdminResponseJson(res);
      if (notJsonMessage || !res.ok) {
        setPanels([]);
        return;
      }
      const rowsRaw = Array.isArray((data as { panels?: unknown })?.panels)
        ? ((data as { panels: unknown[] }).panels as Record<string, unknown>[])
        : [];
      setPanels(
        rowsRaw
          .filter((p) => p.is_active !== false)
          .map((p) => ({
            id: String(p.id),
            label: String(p.label),
          }))
      );
    } catch {
      setPanels([]);
    } finally {
      setLoadingPanels(false);
    }
  }, []);

  useEffect(() => {
    void loadPanels();
  }, [loadPanels]);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setF(rowToFormState(initial));
    } else {
      setF(emptyForm);
    }
  }, [mode, initial]);

  const selectedPlatform = useMemo(
    () => platforms.find((p) => p.id === f.platform_id),
    [platforms, f.platform_id]
  );

  const subOptions = useMemo(() => {
    const subs = selectedPlatform?.subcategories ?? [];
    return subs.filter((s) => s.is_active);
  }, [selectedPlatform]);

  const iconKey =
    selectedPlatform?.icon_key && isSocialPlatformId(selectedPlatform.icon_key)
      ? selectedPlatform.icon_key
      : selectedPlatform?.slug && isSocialPlatformId(selectedPlatform.slug)
        ? selectedPlatform.slug
        : null;

  const matchedPanelService = useMemo(
    () => panelServices.find((s) => s.id === f.panel_service_id.trim()),
    [panelServices, f.panel_service_id]
  );

  const setField = <K extends keyof typeof f>(key: K, value: (typeof f)[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
  };

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const price_from = Number.parseFloat(f.price_from);
      const rating = Number.parseFloat(f.rating);
      const review_count = Number.parseInt(f.review_count, 10);
      if (!Number.isFinite(price_from) || price_from < 0) {
        setError("Invalid price");
        return;
      }
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        setError("Rating must be 0–5");
        return;
      }
      if (!Number.isFinite(review_count) || review_count < 0) {
        setError("Invalid review count");
        return;
      }
      if (!f.platform_id || !f.subcategory_id) {
        setError("Select platform and subcategory");
        return;
      }
      const panelId = f.panel_api_id.trim();
      const svcId = f.panel_service_id.trim();
      if (svcId && !panelId) {
        setError("Select a panel API before assigning a service id");
        return;
      }

      let order_qty_min: number | null = null;
      let order_qty_max: number | null = null;
      if (f.order_qty_min.trim() !== "") {
        order_qty_min = Number.parseInt(f.order_qty_min, 10);
        if (!Number.isFinite(order_qty_min) || order_qty_min < 0) {
          setError("Invalid minimum quantity");
          return;
        }
      }
      if (f.order_qty_max.trim() !== "") {
        order_qty_max = Number.parseInt(f.order_qty_max, 10);
        if (!Number.isFinite(order_qty_max) || order_qty_max < 0) {
          setError("Invalid maximum quantity");
          return;
        }
      }
      if (
        order_qty_min != null &&
        order_qty_max != null &&
        order_qty_min > order_qty_max
      ) {
        setError("Minimum quantity cannot exceed maximum");
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
          setError("Package tiers: each row needs a valid quantity (positive whole number).");
          return;
        }
        if (!Number.isFinite(price) || price < 0) {
          setError("Package tiers: each row needs a valid price (0 or more).");
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

      const featuresPayload = f.features.map((x) => x.trim()).filter((x) => x.length > 0);
      if (featuresPayload.length > 30) {
        setError("Maximum 30 feature lines.");
        return;
      }

      const body = {
        name: f.name.trim(),
        description: f.description.trim(),
        slug: f.slug.trim().toLowerCase(),
        platform_id: f.platform_id,
        subcategory_id: f.subcategory_id,
        price_from,
        duration: f.duration,
        featured: f.featured,
        rating,
        review_count,
        top_review: f.top_review.trim() || null,
        long_description: f.long_description.trim() || null,
        meta_title: f.meta_title.trim() || null,
        meta_description: f.meta_description.trim() || null,
        meta_keywords: f.meta_keywords.trim() || null,
        og_image_url: f.og_image_url.trim() || null,
        robots: f.robots.trim() || null,
        is_active: f.is_active,
        panel_api_id: panelId || null,
        panel_service_id: svcId || null,
        order_qty_min,
        order_qty_max,
        faqs: faqsPayload,
        features: featuresPayload,
        quantity_options,
        checkout_field_label: f.checkout_field_label.trim() || null,
      };

      const res = await fetch("/api/admin/smm-products", {
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

  const fieldClass =
    "w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface";

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
            {mode === "create" ? "Add SMM product" : "Edit product"}
          </p>
          <p className="text-xs text-on-surface-variant">
            Taxonomy drives platform icon + category tiers on the storefront.
          </p>
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
            Platform &amp; subcategory
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-low">
              {iconKey ? (
                <SocialBrandIcon id={iconKey} className="size-8" />
              ) : (
                <span className="text-xs text-on-surface-variant">—</span>
              )}
            </div>
            <p className="max-w-[200px] text-xs text-on-surface-variant">
              Icon follows the selected platform&apos;s catalog <code className="font-mono">icon_key</code>
              .
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Platform
              </label>
              <select
                value={f.platform_id}
                onChange={(e) => {
                  const pid = e.target.value;
                  setF((prev) => ({
                    ...prev,
                    platform_id: pid,
                    subcategory_id: "",
                  }));
                }}
                className={fieldClass}
              >
                <option value="">Select platform…</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Subcategory
              </label>
              <select
                value={f.subcategory_id}
                onChange={(e) => setField("subcategory_id", e.target.value)}
                disabled={!f.platform_id}
                className={cn(fieldClass, !f.platform_id && "opacity-50")}
              >
                <option value="">Select subcategory…</option>
                {subOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Core
          </p>
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
                placeholder="tiktok-followers-starter"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setField("slug", slugifySmmProductLabel(f.name))}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Price from (USD)
              </label>
              <input
                value={f.price_from}
                onChange={(e) => setField("price_from", e.target.value)}
                type="text"
                inputMode="decimal"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Delivery
              </label>
              <select
                value={f.duration}
                onChange={(e) => setField("duration", e.target.value)}
                className={fieldClass}
              >
                {SMM_DURATIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Rating (0–5)
              </label>
              <input
                value={f.rating}
                onChange={(e) => setField("rating", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Review count
              </label>
              <input
                value={f.review_count}
                onChange={(e) => setField("review_count", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Featured review (optional)
            </label>
            <textarea
              value={f.top_review}
              onChange={(e) => setField("top_review", e.target.value)}
              rows={2}
              className={fieldClass}
            />
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
            Leave tiers empty to use the default 4 options from the product category. When you add
            rows, the product page uses only these quantities and prices.
          </p>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Link / username field label
            </label>
            <input
              value={f.checkout_field_label}
              onChange={(e) => setField("checkout_field_label", e.target.value)}
              className={fieldClass}
              placeholder={`e.g. ${selectedPlatform?.label ?? "Instagram"} channel URL`}
            />
            <p className="mt-1 text-[11px] text-on-surface-variant">
              Shown above the profile/link input on the product page. Empty = default (“
              {selectedPlatform?.label ?? "Platform"} profile URL” on desktop).
            </p>
          </div>
          <div className="space-y-3">
            {f.qty_tiers.map((tier, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-lg border border-outline-variant/15 bg-surface-container-low/30 p-3 sm:grid-cols-2"
              >
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                    Tier {i + 1}
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
                              j === i
                                ? { ...r, popular: on }
                                : on
                                  ? { ...r, popular: false }
                                  : r
                            ),
                          }));
                        }}
                        className="size-4 rounded border-outline-variant"
                      />
                      Highlight (default selection)
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
                      aria-label={`Remove tier ${i + 1}`}
                    >
                      <Trash2 className="size-4 stroke-[1.75]" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Quantity
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
                    placeholder="10000"
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
                    placeholder="8.50"
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
                    placeholder="Popular"
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
                    placeholder="Strikethrough price"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[10px] font-bold text-on-surface-variant uppercase">
                    Mobile subtitle (optional)
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
                    placeholder="Instant delivery • High quality"
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
              placeholder="Defaults to product name + site"
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
              placeholder="comma, separated, keywords"
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
            Reseller panel (fulfillment)
          </p>
          <p className="text-xs text-on-surface-variant">
            Map this SKU to a panel service so orders can be sent with{" "}
            <code className="font-mono">action=add</code> later. Uses the same POST API as balance/services.
          </p>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Panel API
            </label>
            <select
              value={f.panel_api_id}
              onChange={(e) => {
                const v = e.target.value;
                setF((prev) => ({ ...prev, panel_api_id: v, panel_service_id: v ? prev.panel_service_id : "" }));
                setPanelServices([]);
                setServicesError(null);
              }}
              disabled={loadingPanels}
              className={cn(fieldClass, loadingPanels && "opacity-60")}
            >
              <option value="">None</option>
              {panels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {panels.length === 0 && !loadingPanels ? (
              <p className="mt-1 text-xs text-amber-800">
                No active panels — add one under Admin → Panel APIs.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              disabled={!f.panel_api_id || loadingServices}
              onClick={async () => {
                setServicesError(null);
                setLoadingServices(true);
                setPanelServices([]);
                try {
                  const res = await fetch("/api/admin/panel-apis/services", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: f.panel_api_id }),
                  });
                  const { data, notJsonMessage } = await readAdminResponseJson(res);
                  if (notJsonMessage) {
                    setServicesError(notJsonMessage);
                    return;
                  }
                  const payload = data as { ok?: boolean; error?: string; services?: unknown };
                  if (!res.ok || !payload.ok) {
                    setServicesError(
                      typeof payload.error === "string" ? payload.error : "Failed to load services"
                    );
                    return;
                  }
                  const list = Array.isArray(payload.services) ? payload.services : [];
                  setPanelServices(list as PanelServiceItem[]);
                  if (list.length === 0) {
                    setServicesError("Panel returned no parseable services (check raw response in Network tab).");
                  }
                } catch (e) {
                  setServicesError(e instanceof Error ? e.message : "Request failed");
                } finally {
                  setLoadingServices(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface disabled:opacity-50"
            >
              {loadingServices ? (
                <Loader2 className="size-4 animate-spin stroke-[1.75]" aria-hidden />
              ) : null}
              Fetch services from panel
            </button>
          </div>
          {servicesError ? (
            <p className="text-xs font-medium text-amber-800">{servicesError}</p>
          ) : null}
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Panel service
            </label>
            <select
              value={
                panelServices.some((s) => s.id === f.panel_service_id)
                  ? f.panel_service_id
                  : ""
              }
              onChange={(e) => {
                const v = e.target.value;
                const s = panelServices.find((x) => x.id === v);
                setF((prev) => ({
                  ...prev,
                  panel_service_id: v,
                  ...(s
                    ? {
                        order_qty_min: parsePanelQtyToFormString(s.min) || "",
                        order_qty_max: parsePanelQtyToFormString(s.max) || "",
                      }
                    : {}),
                }));
              }}
              disabled={!f.panel_api_id || panelServices.length === 0}
              className={cn(
                fieldClass,
                (!f.panel_api_id || panelServices.length === 0) && "opacity-50"
              )}
            >
              <option value="">
                {panelServices.length ? "Pick from list…" : "Fetch services first or type id below"}
              </option>
              {panelServices.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} — {s.name}
                  {s.category ? ` (${s.category})` : ""}
                  {s.rate != null ? ` · ${s.rate}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
              Service id (manual)
            </label>
            <input
              value={f.panel_service_id}
              onChange={(e) => setField("panel_service_id", e.target.value)}
              disabled={!f.panel_api_id}
              className={cn(fieldClass, "font-mono text-xs", !f.panel_api_id && "opacity-50")}
              placeholder="e.g. 1234"
              inputMode="numeric"
            />
            <p className="mt-1 text-[11px] text-on-surface-variant">
              Dropdown sets this field; you can also paste the id from your panel.
            </p>
          </div>

          {matchedPanelService ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-on-surface">
              <span className="font-bold text-primary">Panel service limits</span>
              <span className="mx-1 text-on-surface-variant">·</span>
              <span>
                min <strong className="text-on-surface">{matchedPanelService.min ?? "—"}</strong>
              </span>
              <span className="mx-1 text-on-surface-variant">—</span>
              <span>
                max <strong className="text-on-surface">{matchedPanelService.max ?? "—"}</strong>
              </span>
            </div>
          ) : f.panel_service_id.trim() && panelServices.length > 0 ? (
            <p className="text-xs text-on-surface-variant">
              Service id not in the last fetched list — limits shown only when the id matches a
              fetched row.
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Saved min quantity
              </label>
              <input
                value={f.order_qty_min}
                onChange={(e) => setField("order_qty_min", e.target.value)}
                className={cn(fieldClass, "font-mono text-xs")}
                placeholder="e.g. 100"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                Saved max quantity
              </label>
              <input
                value={f.order_qty_max}
                onChange={(e) => setField("order_qty_max", e.target.value)}
                className={cn(fieldClass, "font-mono text-xs")}
                placeholder="e.g. 10000"
                inputMode="numeric"
              />
            </div>
          </div>
          {matchedPanelService ? (
            <button
              type="button"
              onClick={() => {
                const s = matchedPanelService;
                setF((prev) => ({
                  ...prev,
                  order_qty_min: parsePanelQtyToFormString(s.min) || "",
                  order_qty_max: parsePanelQtyToFormString(s.max) || "",
                }));
              }}
              className="rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface"
            >
              Reset saved min/max from panel
            </button>
          ) : null}
          <p className="text-[11px] text-on-surface-variant">
            Values are stored on the product for checkout / panel orders. Leave blank to clear.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Product features
          </p>
          <p className="text-xs text-on-surface-variant">
            One line per bullet — shown with green checkmarks in the &quot;Configure your package&quot;
            panel on the product page. Leave empty to hide the block.
          </p>
          <div className="space-y-2">
            {f.features.map((line, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={line}
                  onChange={(e) =>
                    setF((prev) => {
                      const next = [...prev.features];
                      next[i] = e.target.value;
                      return { ...prev, features: next };
                    })
                  }
                  className={fieldClass}
                  placeholder="e.g. High-retention delivery"
                />
                <button
                  type="button"
                  onClick={() =>
                    setF((prev) => ({
                      ...prev,
                      features: prev.features.filter((_, j) => j !== i),
                    }))
                  }
                  className="shrink-0 rounded-lg border border-outline-variant/25 p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-red-600"
                  aria-label={`Remove feature ${i + 1}`}
                >
                  <Trash2 className="size-4 stroke-[1.75]" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setF((prev) => ({ ...prev, features: [...prev.features, ""] }))}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            Add feature line
          </button>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface p-4">
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Product FAQs
          </p>
          <p className="text-xs text-on-surface-variant">
            If you add at least one question, these replace the generic FAQ block on the public
            product page.
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
          disabled={saving}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
        >
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
