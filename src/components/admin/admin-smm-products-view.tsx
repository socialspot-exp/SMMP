"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ListFilter,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import {
  type SocialPlatformId,
  isSocialPlatformId,
} from "@/components/home/social-brand";
import { AdminSmmProductForm } from "@/components/admin/admin-smm-product-form";
import type { SmmPlatformDTO } from "@/lib/smm-catalog-api";
import type { SmmProductRow } from "@/lib/smm-products-api";
import { readAdminResponseJson } from "@/lib/admin-response-json";
import { smmProductPath } from "@/lib/smm-product-helpers";
import { SMM_CATEGORIES, SMM_DURATIONS, SMM_PLATFORMS } from "@/lib/services-data";
import { cn } from "@/lib/utils";

type PlatformFilter = "all" | SocialPlatformId;

function platformLabel(id: string) {
  return SMM_PLATFORMS.find((p) => p.id === id)?.label ?? id;
}

function categoryLabel(id: string) {
  return SMM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function durationLabel(id: string) {
  return SMM_DURATIONS.find((d) => d.id === id)?.label ?? id;
}

export function AdminSmmProductsView({ className }: { className?: string }) {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SmmProductRow[]>([]);
  const [platforms, setPlatforms] = useState<SmmPlatformDTO[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editRow, setEditRow] = useState<SmmProductRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/smm-products", { credentials: "include" }),
        fetch("/api/admin/smm-catalog", { credentials: "include" }),
      ]);
      const [pRead, cRead] = await Promise.all([
        readAdminResponseJson(pRes),
        readAdminResponseJson(cRes),
      ]);
      let err: string | null = null;
      if (pRead.notJsonMessage) {
        err = pRead.notJsonMessage;
        setProducts([]);
      } else if (!pRes.ok) {
        const pJson = pRead.data as { error?: string } | null;
        err = typeof pJson?.error === "string" ? pJson.error : pRes.statusText;
        setProducts([]);
      } else {
        const pJson = pRead.data as { products?: unknown } | null;
        setProducts(Array.isArray(pJson?.products) ? pJson.products : []);
      }
      if (cRead.notJsonMessage) {
        setPlatforms([]);
        err = err ?? cRead.notJsonMessage;
      } else if (!cRes.ok) {
        setPlatforms([]);
        const cJson = cRead.data as { error?: string } | null;
        err = err ?? (typeof cJson?.error === "string" ? cJson.error : "Catalog load failed");
      } else {
        const cJson = cRead.data as { platforms?: unknown } | null;
        setPlatforms(Array.isArray(cJson?.platforms) ? cJson.platforms : []);
      }
      setLoadError(err);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load failed");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const n = products.length;
    const featured = products.filter((s) => s.featured).length;
    const platformsN = new Set(products.map((s) => s.platform)).size;
    const avg =
      n > 0
        ? (products.reduce((a, s) => a + Number(s.price_from), 0) / n).toFixed(2)
        : "0";
    return { total: n, featured, platforms: platformsN, avgPrice: avg };
  }, [products]);

  const filtered = useMemo(() => {
    let rows = products;
    if (platform !== "all") {
      rows = rows.filter((s) => s.platform === platform);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.slug && s.slug.toLowerCase().includes(q)) ||
          platformLabel(s.platform).toLowerCase().includes(q)
      );
    }
    return rows;
  }, [products, platform, query]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const visibleIds = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.has(id));
  const headerSelectRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = headerSelectRef.current;
    if (!el) return;
    el.indeterminate = someVisibleSelected && !allVisibleSelected;
  }, [allVisibleSelected, someVisibleSelected]);

  const toggleSelectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (allVisibleSelected) {
        for (const id of visibleIds) n.delete(id);
      } else {
        for (const id of visibleIds) n.add(id);
      }
      return n;
    });
  }, [allVisibleSelected, visibleIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const bulkDelete = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Delete ${ids.length} product(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/smm-products", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const { data, notJsonMessage } = await readAdminResponseJson(res);
      if (notJsonMessage) {
        window.alert(notJsonMessage);
        return;
      }
      if (!res.ok) {
        const j = data as { error?: string } | null;
        window.alert(typeof j?.error === "string" ? j.error : "Delete failed");
        return;
      }
      clearSelection();
      await load();
    } finally {
      setBulkDeleting(false);
    }
  }, [clearSelection, load, selectedIds]);

  const filterBtn = (filterKey: PlatformFilter, label: string) => (
    <button
      key={String(filterKey)}
      type="button"
      onClick={() => setPlatform(filterKey)}
      className={cn(
        "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
        platform === filterKey
          ? "bg-primary text-on-primary"
          : "bg-surface text-on-surface-variant hover:bg-surface-container"
      )}
    >
      {label}
    </button>
  );

  const platformIdsInUse = useMemo(() => {
    const u = [...new Set(products.map((s) => s.platform))];
    return u.filter((id): id is SocialPlatformId => isSocialPlatformId(id));
  }, [products]);

  return (
    <div className={cn("relative mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8", className)}>
      {formMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-lg animate-in slide-in-from-right duration-200">
            <AdminSmmProductForm
              platforms={platforms}
              mode={formMode === "create" ? "create" : "edit"}
              initial={formMode === "edit" ? editRow : null}
              onClose={() => {
                setFormMode(null);
                setEditRow(null);
              }}
              onSaved={() => void load()}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            SMM Products
          </h2>
          <p className="font-medium text-on-surface-variant">
            Supabase-backed catalog — add SKUs, SEO, and taxonomy tied to platforms &amp; subcategories.
          </p>
          {loadError ? (
            <div className="mt-2 space-y-1.5 text-sm font-medium text-amber-800">
              <p>{loadError}</p>
              <p className="text-xs font-normal text-amber-900/90">
                Database out of date? Apply Supabase migrations through{" "}
                <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">012</code>
                {" — "}
                panel, qty, FAQs, features, storefront tiers, checkout label.{" "}
                <code className="font-mono text-[11px]">supabase db push</code> or paste SQL from{" "}
                <code className="font-mono text-[11px]">app/supabase/migrations/</code>.
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-on-surface opacity-50 shadow-sm"
            title="Coming soon"
          >
            <Download className="size-5 stroke-[1.75]" aria-hidden />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setEditRow(null);
              setFormMode("create");
            }}
            disabled={loading || platforms.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-[0.98] disabled:opacity-50"
          >
            <Plus className="size-5 stroke-[1.75]" aria-hidden />
            New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {(
          [
            { label: "Total SKUs", value: String(stats.total), valueClass: "text-on-surface" },
            { label: "Featured", value: String(stats.featured), valueClass: "text-primary" },
            { label: "Platforms", value: String(stats.platforms), valueClass: "text-green-600" },
            { label: "Avg. from price", value: `$${stats.avgPrice}`, valueClass: "text-on-surface" },
          ] as const
        ).map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5"
          >
            <p className="mb-1 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
              {s.label}
            </p>
            <p className={cn("font-headline text-2xl font-extrabold", s.valueClass)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-xl shadow-on-surface/5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/10 bg-surface-container-low/30 p-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {filterBtn("all", "All platforms")}
            {platformIdsInUse.map((p) => filterBtn(p, platformLabel(p)))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ListFilter className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-on-surface-variant stroke-[1.75]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, ID, slug…"
                className="w-48 rounded-full border-none bg-surface py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none md:w-56"
              />
            </div>
          </div>
        </div>
        <div className="border-b border-outline-variant/10 px-4 py-2 text-xs font-medium text-on-surface-variant">
          {loading ? "Loading…" : `Showing ${filtered.length} of ${products.length} products`}
        </div>

        {selectedIds.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant/10 bg-amber-50/80 px-4 py-2.5">
            <span className="text-xs font-bold text-amber-950">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              disabled={bulkDeleting}
              className="rounded-lg border border-amber-200/80 bg-white px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-100/50 disabled:opacity-50"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => void bulkDelete()}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="size-3.5 stroke-2" aria-hidden />
              {bulkDeleting ? "Deleting…" : "Delete selected"}
            </button>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="w-12 px-3 py-4">
                  <input
                    ref={headerSelectRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    disabled={loading || visibleIds.length === 0}
                    className="size-4 rounded border-outline-variant"
                    aria-label="Select all visible rows"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Slug
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Platform
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  From
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Delivery
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Featured
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Active
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Rating
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-surface">
                  <td className="px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="size-4 rounded border-outline-variant"
                      aria-label={`Select ${s.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{s.id}</td>
                  <td className="max-w-[120px] truncate px-6 py-4 font-mono text-xs text-on-surface-variant">
                    {s.slug}
                  </td>
                  <td className="max-w-[220px] px-6 py-4">
                    <span className="line-clamp-2 text-sm font-semibold text-on-surface">{s.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-bold text-on-surface">
                      {platformLabel(s.platform)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {categoryLabel(s.category)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">
                    ${Number(s.price_from).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {durationLabel(s.duration)}
                  </td>
                  <td className="px-6 py-4">
                    {s.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-amber-700 uppercase">
                        <Star className="size-3 fill-amber-500 text-amber-500 stroke-[1.5]" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-on-surface-variant">
                    {s.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">
                    {s.rating}{" "}
                    <span className="text-on-surface-variant">({s.review_count})</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={smmProductPath({ id: s.id, slug: s.slug })}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                        title="View storefront"
                      >
                        <ExternalLink className="size-5 stroke-[1.75]" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditRow(s);
                          setFormMode("edit");
                        }}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                        title="Edit"
                      >
                        <Pencil className="size-5 stroke-[1.75]" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/10 bg-surface-container-low/20 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border border-outline-variant/20 bg-surface p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-50"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4 stroke-[1.75]" aria-hidden />
            </button>
            <span className="px-2 text-xs text-on-surface-variant">Page 1</span>
            <button
              type="button"
              disabled
              className="rounded-lg border border-outline-variant/20 bg-surface p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-50"
              aria-label="Next"
            >
              <ChevronRight className="size-4 stroke-[1.75]" aria-hidden />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-on-surface-variant">Rows per page</label>
            <select className="rounded-lg border border-outline-variant/20 bg-surface px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
