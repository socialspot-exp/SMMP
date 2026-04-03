"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ListFilter,
  Pencil,
  Plus,
  Star,
} from "lucide-react";
import { AdminPremiumProductForm } from "@/components/admin/admin-premium-product-form";
import type { PremiumCatalogCategoryDTO } from "@/lib/premium-catalog-api";
import {
  premiumProductRowFromApiJson,
  type PremiumProductRow,
} from "@/lib/premium-products-api";
import { formatAdminApiError, readAdminResponseJson } from "@/lib/admin-response-json";
import {
  type PremiumCategory,
  PREMIUM_BILLING,
  PREMIUM_CATEGORIES,
} from "@/lib/services-data";
import { cn } from "@/lib/utils";

type CatFilter = "all" | PremiumCategory;

function categoryLabel(id: string) {
  return PREMIUM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function billingLabel(id: string) {
  return PREMIUM_BILLING.find((b) => b.id === id)?.label ?? id;
}

export function AdminPremiumProductsView({ className }: { className?: string }) {
  const [category, setCategory] = useState<CatFilter>("all");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PremiumProductRow[]>([]);
  const [catalog, setCatalog] = useState<PremiumCatalogCategoryDTO[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editRow, setEditRow] = useState<PremiumProductRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/premium-products", { credentials: "include" }),
        fetch("/api/admin/premium-catalog", { credentials: "include" }),
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
        const j = pRead.data as { error?: string } | null;
        err = typeof j?.error === "string" ? j.error : pRes.statusText;
        setProducts([]);
      } else {
        const j = pRead.data as { products?: unknown } | null;
        const raw = Array.isArray(j?.products) ? j.products : [];
        setProducts(
          raw
            .map((x) =>
              x && typeof x === "object" ? premiumProductRowFromApiJson(x as Record<string, unknown>) : null
            )
            .filter((x): x is PremiumProductRow => x != null)
        );
      }
      if (cRead.notJsonMessage) {
        setCatalog([]);
        err = err ?? cRead.notJsonMessage;
      } else if (!cRes.ok) {
        setCatalog([]);
        const j = cRead.data as { error?: string } | null;
        err = err ?? (typeof j?.error === "string" ? j.error : "Catalog load failed");
      } else {
        const j = cRead.data as { categories?: unknown } | null;
        setCatalog(Array.isArray(j?.categories) ? (j.categories as PremiumCatalogCategoryDTO[]) : []);
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
    const sum = products.reduce((a, s) => a + Number(s.price_from), 0);
    return { total: n, featured, catalogFloor: sum.toFixed(0) };
  }, [products]);

  const filtered = useMemo(() => {
    let rows = products;
    if (category !== "all") {
      rows = rows.filter((s) => s.category === category);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          categoryLabel(s.category).toLowerCase().includes(q)
      );
    }
    return rows;
  }, [category, query, products]);

  const filterBtn = (filterKey: CatFilter, label: string) => (
    <button
      key={String(filterKey)}
      type="button"
      onClick={() => setCategory(filterKey)}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        category === filterKey
          ? "bg-primary/10 font-bold text-primary"
          : "text-on-surface-variant hover:bg-surface-container"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className={cn("relative mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8", className)}>
      {formMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-lg animate-in slide-in-from-right duration-200">
            <AdminPremiumProductForm
              categories={catalog}
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

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Premium Products
          </h2>
          <p className="mt-1 text-on-surface-variant">
            Supabase catalog — SKUs, verticals, billing, and storefront pricing.
          </p>
          {loadError ? (
            <p className="mt-2 text-sm font-medium text-amber-800">
              {loadError}
              {" — "}
              Run migration <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">004</code>
              / <code className="font-mono text-xs">006</code> if tables are missing.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="flex items-center gap-2 rounded-xl bg-surface-container-low px-5 py-2.5 font-semibold text-on-surface opacity-50"
            title="Coming soon"
          >
            <Download className="size-4 stroke-[1.75]" aria-hidden />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setEditRow(null);
              setFormMode("create");
            }}
            disabled={loading || catalog.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-[0.98] disabled:opacity-50"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Total SKUs</p>
          <h3 className="mt-1 text-2xl font-bold">{stats.total}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Featured</p>
          <h3 className="mt-1 text-2xl font-bold text-primary">{stats.featured}</h3>
        </div>
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Categories in use</p>
          <h3 className="mt-1 text-2xl font-bold">
            {new Set(products.map((s) => s.category)).size}
          </h3>
        </div>
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Σ list “from” prices</p>
          <h3 className="mt-1 text-2xl font-bold">${stats.catalogFloor}</h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container p-6">
          <div className="flex flex-wrap items-center gap-2">
            {filterBtn("all", "All")}
            {PREMIUM_CATEGORIES.map((c) => filterBtn(c.id, c.label))}
          </div>
          <div className="relative">
            <ListFilter className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-on-surface-variant stroke-[1.75]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full min-w-[200px] rounded-xl border-none bg-surface-container-low py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="border-b border-outline-variant/10 px-6 py-2 text-xs text-on-surface-variant">
          {loading ? "Loading…" : `Showing ${filtered.length} of ${products.length} products`}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Billing
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  From
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Seats
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
                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    No products loaded. Check Supabase connection or add a product.
                  </td>
                </tr>
              ) : null}
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-surface-container-low/30">
                  <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">{s.id}</td>
                  <td className="max-w-[240px] px-6 py-5">
                    <span className="font-semibold text-on-surface">{s.name}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {categoryLabel(s.category)}
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {billingLabel(s.billing)}
                  </td>
                  <td className="px-6 py-5 font-bold text-on-surface">
                    ${Number(s.price_from).toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{s.seats ?? "—"}</td>
                  <td className="px-6 py-5">
                    {s.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                        <Star className="size-3 fill-amber-500 text-amber-500 stroke-[1.5]" />
                        Featured
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-on-surface-variant">
                    {s.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-5 text-sm">
                    {s.rating}{" "}
                    <span className="text-on-surface-variant">({s.review_count})</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/services/premium/${s.id}`}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                        title="Storefront"
                      >
                        <ExternalLink className="size-5 stroke-[1.75]" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditRow(s);
                          setFormMode("edit");
                        }}
                        className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
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

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-container p-6">
          <p className="text-xs font-medium text-on-surface-variant">
            Showing {filtered.length} of {products.length} products
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5 stroke-[1.75]" aria-hidden />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-on-primary">
              1
            </span>
            <button
              type="button"
              disabled
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
              aria-label="Next"
            >
              <ChevronRight className="size-5 stroke-[1.75]" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
