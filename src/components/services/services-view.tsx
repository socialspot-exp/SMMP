"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialBrandIcon, type SocialPlatformId, isSocialPlatformId } from "@/components/home/social-brand";
import { cn } from "@/lib/utils";
import { CategoryIconProvider, useServiceCategoryIcons } from "@/components/services/category-icon-context";
import {
  PremiumCatalogIcon,
  isPremiumCatalogIconKey,
  premiumCatalogIconColorClass,
  type PremiumCatalogIconKey,
} from "@/lib/premium-catalog-icons";
import type { PremiumCatalogCategoryDTO } from "@/lib/premium-catalog-api";
import type { SmmPlatformDTO } from "@/lib/smm-catalog-api";
import { SmmCard } from "@/components/services/smm-service-card";
import {
  type PremiumCategory,
  type PremiumService,
  type SMMService,
  type SortKey,
  PREMIUM_BILLING,
  PREMIUM_CATEGORIES,
  PREMIUM_SERVICES,
  SMM_CATEGORIES,
  SMM_DURATIONS,
  SMM_PLATFORMS,
  SMM_SERVICES,
  SORT_OPTIONS,
} from "@/lib/services-data";

function filterSmm(
  items: SMMService[],
  opts: {
    q: string;
    platforms: Set<string>;
    category: string;
    duration: string;
    priceMin: string;
    priceMax: string;
  }
) {
  const q = opts.q.trim().toLowerCase();
  const min = opts.priceMin === "" ? null : Number(opts.priceMin);
  const max = opts.priceMax === "" ? null : Number(opts.priceMax);
  return items.filter((s) => {
    if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) {
      return false;
    }
    if (opts.platforms.size > 0 && !opts.platforms.has(s.platform)) return false;
    if (opts.category !== "all" && s.category !== opts.category) return false;
    if (opts.duration !== "all" && s.duration !== opts.duration) return false;
    if (min !== null && !Number.isNaN(min) && s.priceFrom < min) return false;
    if (max !== null && !Number.isNaN(max) && s.priceFrom > max) return false;
    return true;
  });
}

function filterPremium(
  items: PremiumService[],
  opts: {
    q: string;
    /** Empty set = all categories */
    categorySlugs: Set<string>;
    /** Matches product `billing` (subcategory slug) */
    subcategory: string;
    priceMin: string;
    priceMax: string;
  }
) {
  const q = opts.q.trim().toLowerCase();
  const min = opts.priceMin === "" ? null : Number(opts.priceMin);
  const max = opts.priceMax === "" ? null : Number(opts.priceMax);
  return items.filter((s) => {
    if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) {
      return false;
    }
    if (opts.categorySlugs.size > 0 && !opts.categorySlugs.has(s.category)) return false;
    if (opts.subcategory !== "all" && s.billing !== opts.subcategory) return false;
    if (min !== null && !Number.isNaN(min) && s.priceFrom < min) return false;
    if (max !== null && !Number.isNaN(max) && s.priceFrom > max) return false;
    return true;
  });
}

function sortSmm(items: SMMService[], key: SortKey) {
  const copy = [...items];
  const feat = (a: SMMService, b: SMMService) =>
    Number(b.featured) - Number(a.featured);
  switch (key) {
    case "featured":
      return copy.sort((a, b) => feat(a, b) || b.rating - a.rating);
    case "price-asc":
      return copy.sort((a, b) => a.priceFrom - b.priceFrom);
    case "price-desc":
      return copy.sort((a, b) => b.priceFrom - a.priceFrom);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "reviews":
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return copy;
  }
}

function sortPremium(items: PremiumService[], key: SortKey) {
  const copy = [...items];
  const feat = (a: PremiumService, b: PremiumService) =>
    Number(b.featured) - Number(a.featured);
  switch (key) {
    case "featured":
      return copy.sort((a, b) => feat(a, b) || b.rating - a.rating);
    case "price-asc":
      return copy.sort((a, b) => a.priceFrom - b.priceFrom);
    case "price-desc":
      return copy.sort((a, b) => b.priceFrom - a.priceFrom);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "reviews":
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return copy;
  }
}

type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:border-outline-variant/50"
      )}
    >
      {children}
    </button>
  );
}

function PremiumCategoryGlyph({
  categoryId,
  catalog,
  iconClassName,
}: {
  categoryId: PremiumCategory;
  catalog: PremiumCatalogCategoryDTO[];
  iconClassName?: string;
}) {
  const { premiumIcons } = useServiceCategoryIcons();
  const row = catalog.find((c) => c.slug === categoryId);
  const fromDb = row?.icon_key && isPremiumCatalogIconKey(row.icon_key) ? row.icon_key : null;
  const fromLs = premiumIcons[categoryId];
  const fallback =
    fromLs && isPremiumCatalogIconKey(fromLs) ? fromLs : ("Sparkles" as const);
  const iconKey = (fromDb ?? fallback) as PremiumCatalogIconKey;
  return (
    <PremiumCatalogIcon
      name={iconKey}
      className={cn(
        "size-3.5 shrink-0",
        premiumCatalogIconColorClass(iconKey),
        iconClassName
      )}
    />
  );
}

export type ServicesViewVariant = "full" | "dashboard";

function ServicesViewInner({ variant = "full" }: { variant?: ServicesViewVariant }) {
  const [smmQ, setSmmQ] = useState("");
  const [smmSort, setSmmSort] = useState<SortKey>("featured");
  const [smmPlatforms, setSmmPlatforms] = useState<Set<string>>(new Set());
  const [smmCategory, setSmmCategory] = useState("all");
  const [smmDuration, setSmmDuration] = useState("all");
  const [smmPriceMin, setSmmPriceMin] = useState("");
  const [smmPriceMax, setSmmPriceMax] = useState("");
  const [smmFiltersOpen, setSmmFiltersOpen] = useState(false);

  const [premQ, setPremQ] = useState("");
  const [premSort, setPremSort] = useState<SortKey>("featured");
  const [premCategories, setPremCategories] = useState<Set<string>>(() => new Set());
  const [premSubcategory, setPremSubcategory] = useState("all");
  const [premPriceMin, setPremPriceMin] = useState("");
  const [premPriceMax, setPremPriceMax] = useState("");
  const [premFiltersOpen, setPremFiltersOpen] = useState(false);

  const [premCatalogCategories, setPremCatalogCategories] = useState<PremiumCatalogCategoryDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/premium-catalog")
      .then((r) => r.json())
      .then((data: { categories?: PremiumCatalogCategoryDTO[] }) => {
        if (!cancelled && Array.isArray(data.categories) && data.categories.length > 0) {
          setPremCatalogCategories(data.categories);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const [smmCatalogPlatforms, setSmmCatalogPlatforms] = useState<SmmPlatformDTO[]>([]);
  const [smmServices, setSmmServices] = useState<SMMService[]>(SMM_SERVICES);
  const [premServices, setPremServices] = useState<PremiumService[]>(PREMIUM_SERVICES);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/premium-products")
      .then((r) => r.json())
      .then((data: { products?: PremiumService[] }) => {
        if (cancelled) return;
        if (Array.isArray(data.products) && data.products.length > 0) {
          setPremServices(data.products);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/smm-products")
      .then((r) => r.json())
      .then((data: { products?: SMMService[] }) => {
        if (cancelled) return;
        if (Array.isArray(data.products) && data.products.length > 0) {
          setSmmServices(data.products);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/smm-catalog")
      .then((r) => r.json())
      .then((data: { platforms?: SmmPlatformDTO[] }) => {
        if (!cancelled && Array.isArray(data.platforms) && data.platforms.length > 0) {
          setSmmCatalogPlatforms(data.platforms);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const smmPlatformChips = useMemo(() => {
    if (smmCatalogPlatforms.length > 0) {
      return smmCatalogPlatforms.map((p) => ({
        id: p.slug,
        label: p.label,
        iconKey: (isSocialPlatformId(p.icon_key) ? p.icon_key : p.slug) as SocialPlatformId,
      }));
    }
    return SMM_PLATFORMS.map((p) => ({
      id: p.id,
      label: p.label,
      iconKey: p.id,
    }));
  }, [smmCatalogPlatforms]);

  const smmSubcategoryOptions = useMemo(() => {
    if (smmCatalogPlatforms.length > 0) {
      const seen = new Map<string, string>();
      for (const pl of smmCatalogPlatforms) {
        for (const sub of pl.subcategories) {
          if (!seen.has(sub.slug)) seen.set(sub.slug, sub.label);
        }
      }
      return [...seen.entries()]
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return SMM_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));
  }, [smmCatalogPlatforms]);

  const premCategoryChips = useMemo(() => {
    if (premCatalogCategories.length > 0) {
      return premCatalogCategories.map((c) => ({
        id: c.slug,
        label: c.label,
        iconKey: c.icon_key,
      }));
    }
    return PREMIUM_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      iconKey: null as string | null,
    }));
  }, [premCatalogCategories]);

  const premSubcategoryOptions = useMemo(() => {
    if (premCatalogCategories.length > 0) {
      const seen = new Map<string, string>();
      for (const cat of premCatalogCategories) {
        for (const sub of cat.subcategories) {
          if (!seen.has(sub.slug)) seen.set(sub.slug, sub.label);
        }
      }
      return [...seen.entries()]
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return PREMIUM_BILLING.map((b) => ({ id: b.id, label: b.label }));
  }, [premCatalogCategories]);

  const smmFiltered = useMemo(
    () =>
      filterSmm(smmServices, {
        q: smmQ,
        platforms: smmPlatforms,
        category: smmCategory,
        duration: smmDuration,
        priceMin: smmPriceMin,
        priceMax: smmPriceMax,
      }),
    [smmServices, smmQ, smmPlatforms, smmCategory, smmDuration, smmPriceMin, smmPriceMax]
  );

  const smmSorted = useMemo(() => sortSmm(smmFiltered, smmSort), [smmFiltered, smmSort]);
  const smmFeatured = useMemo(
    () => smmFiltered.filter((s) => s.featured).slice(0, 4),
    [smmFiltered]
  );

  const premFiltered = useMemo(
    () =>
      filterPremium(premServices, {
        q: premQ,
        categorySlugs: premCategories,
        subcategory: premSubcategory,
        priceMin: premPriceMin,
        priceMax: premPriceMax,
      }),
    [premServices, premQ, premCategories, premSubcategory, premPriceMin, premPriceMax]
  );
  const premSorted = useMemo(() => sortPremium(premFiltered, premSort), [premFiltered, premSort]);
  const premFeatured = useMemo(
    () => premFiltered.filter((s) => s.featured).slice(0, 4),
    [premFiltered]
  );

  const toggleSmmPlatform = (id: string) => {
    setSmmPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePremCategory = (slug: string) => {
    setPremCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const resetSmm = () => {
    setSmmQ("");
    setSmmSort("featured");
    setSmmPlatforms(new Set());
    setSmmCategory("all");
    setSmmDuration("all");
    setSmmPriceMin("");
    setSmmPriceMax("");
  };

  const resetPrem = () => {
    setPremQ("");
    setPremSort("featured");
    setPremCategories(new Set());
    setPremSubcategory("all");
    setPremPriceMin("");
    setPremPriceMax("");
  };

  const isDashboard = variant === "dashboard";

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl",
        isDashboard ? "px-4 pb-10 pt-2 md:px-0 md:py-4" : "px-6 py-10"
      )}
    >
        {isDashboard ? (
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">
              Your marketplace
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
              Services
            </h1>
            <p className="mt-3 text-on-surface-variant">
              Order SMM boosts or premium accounts — same catalog as the public site, with filters
              for each type.
            </p>
          </div>
        ) : null}

        <div className={cn("mb-12 flex flex-wrap gap-2", isDashboard && "mb-8")}>
          <a
            href="#smm-services"
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary"
          >
            SMM services
          </a>
          <a
            href="#premium-services"
            className="rounded-full border border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container"
          >
            Premium accounts
          </a>
        </div>

        {/* ——— SMM ——— */}
        <section
          id="smm-services"
          className={cn("mb-20 scroll-mt-24", isDashboard && "scroll-mt-28")}
        >
          <div className="mb-8 flex flex-col gap-2 border-b border-outline-variant/15 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface md:text-3xl">
                SMM services
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Followers, engagement, watch time — filter by platform, subcategory, delivery, and
                budget.
              </p>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">
              {smmSorted.length} results
            </span>
          </div>

          {smmFeatured.length > 0 && (
            <div className="mb-10">
              <h3 className="mb-4 flex items-center gap-2 font-headline text-sm font-bold tracking-wide text-secondary uppercase">
                <span className="h-4 w-1 rounded-full bg-secondary" />
                Featured SMM
              </h3>
              <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
                {smmFeatured.map((s) => (
                  <SmmCard key={s.id} service={s} featuredLayout />
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search SMM services…"
                value={smmQ}
                onChange={(e) => setSmmQ(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest py-2.5 pr-3 pl-10 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={smmSort}
                onChange={(e) => setSmmSort(e.target.value as SortKey)}
                className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="lg:hidden"
                onClick={() => setSmmFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
            </div>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside
              className={cn(
                "space-y-6 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5",
                smmFiltersOpen ? "block" : "hidden lg:block"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-headline text-sm font-bold">Filters</span>
                <button
                  type="button"
                  onClick={resetSmm}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset
                </button>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                  Platform
                </p>
                <div className="flex flex-wrap gap-2">
                  {smmPlatformChips.map((p) => (
                    <Chip
                      key={p.id}
                      active={smmPlatforms.has(p.id)}
                      onClick={() => toggleSmmPlatform(p.id)}
                    >
                      <span className="flex items-center gap-1.5">
                        <SocialBrandIcon id={p.iconKey} className="size-3.5" />
                        {p.label}
                      </span>
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                  Subcategory
                </p>
                <select
                  value={smmCategory}
                  onChange={(e) => setSmmCategory(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm"
                >
                  <option value="all">All subcategories</option>
                  {smmSubcategoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                  Delivery
                </p>
                <select
                  value={smmDuration}
                  onChange={(e) => setSmmDuration(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm"
                >
                  <option value="all">Any duration</option>
                  {SMM_DURATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                  Price from ($)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={smmPriceMin}
                    onChange={(e) => setSmmPriceMin(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={smmPriceMax}
                    onChange={(e) => setSmmPriceMax(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-full lg:hidden"
                onClick={() => setSmmFiltersOpen(false)}
              >
                Apply
              </Button>
            </aside>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {smmSorted.map((s) => (
                <SmmCard key={s.id} service={s} />
              ))}
            </div>
          </div>

          {smmSorted.length === 0 && (
            <p className="rounded-xl border border-dashed border-outline-variant/40 py-12 text-center text-sm text-on-surface-variant">
              No SMM services match these filters.{" "}
              <button type="button" onClick={resetSmm} className="font-semibold text-primary">
                Reset filters
              </button>
            </p>
          )}
        </section>

        {/* ——— Premium ——— */}
        <section
          id="premium-services"
          className={cn("scroll-mt-24", isDashboard && "scroll-mt-28")}
        >
          <div className="mb-8 flex flex-col gap-2 border-b border-outline-variant/15 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface md:text-3xl">
                Premium account services
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Streaming, music, tools — filter by category, subcategory (billing), and price.
              </p>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">
              {premSorted.length} results
            </span>
          </div>

          {premFeatured.length > 0 && (
            <div className="mb-10">
              <h3 className="mb-4 flex items-center gap-2 font-headline text-sm font-bold tracking-wide text-tertiary uppercase">
                <span className="h-4 w-1 rounded-full bg-tertiary" />
                Featured premium
              </h3>
              <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
                {premFeatured.map((s) => (
                  <PremiumCard
                    key={s.id}
                    service={s}
                    featuredLayout
                    catalog={premCatalogCategories}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search premium services…"
                value={premQ}
                onChange={(e) => setPremQ(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest py-2.5 pr-3 pl-10 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={premSort}
                onChange={(e) => setPremSort(e.target.value as SortKey)}
                className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="lg:hidden"
                onClick={() => setPremFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
            </div>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside
              className={cn(
                "space-y-6 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5",
                premFiltersOpen ? "block" : "hidden lg:block"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-headline text-sm font-bold">Filters</span>
                <button
                  type="button"
                  onClick={resetPrem}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset
                </button>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {premCategoryChips.map((c) => (
                    <Chip
                      key={c.id}
                      active={premCategories.has(c.id)}
                      onClick={() => togglePremCategory(c.id)}
                    >
                      <span className="flex items-center gap-1.5">
                        {c.iconKey && isPremiumCatalogIconKey(c.iconKey) ? (
                          <PremiumCatalogIcon
                            name={c.iconKey}
                            className="size-3.5 stroke-[1.75]"
                          />
                        ) : null}
                        {c.label}
                      </span>
                    </Chip>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-on-surface-variant">
                  Leave none selected for all categories.
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                  Subcategory
                </p>
                <select
                  value={premSubcategory}
                  onChange={(e) => setPremSubcategory(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm"
                >
                  <option value="all">All subcategories</option>
                  {premSubcategoryOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                  Price from ($)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={premPriceMin}
                    onChange={(e) => setPremPriceMin(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={premPriceMax}
                    onChange={(e) => setPremPriceMax(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-full lg:hidden"
                onClick={() => setPremFiltersOpen(false)}
              >
                Apply
              </Button>
            </aside>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {premSorted.map((s) => (
                <PremiumCard key={s.id} service={s} catalog={premCatalogCategories} />
              ))}
            </div>
          </div>

          {premSorted.length === 0 && (
            <p className="rounded-xl border border-dashed border-outline-variant/40 py-12 text-center text-sm text-on-surface-variant">
              No premium services match these filters.{" "}
              <button type="button" onClick={resetPrem} className="font-semibold text-primary">
                Reset filters
              </button>
            </p>
          )}
        </section>
    </div>
  );
}

function PremiumCard({
  service: s,
  featuredLayout,
  catalog,
}: {
  service: PremiumService;
  featuredLayout?: boolean;
  catalog: PremiumCatalogCategoryDTO[];
}) {
  const cat = PREMIUM_CATEGORIES.find((c) => c.id === s.category)?.label ?? s.category;
  const bill = PREMIUM_BILLING.find((b) => b.id === s.billing)?.label ?? s.billing;
  const href = `/services/premium/${s.id}`;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border border-outline-variant/12 bg-surface-container-lowest p-8 shadow-[0_8px_32px_-12px_rgba(44,47,50,0.14)] transition-shadow duration-300 hover:shadow-[0_14px_44px_-16px_rgba(44,47,50,0.2)]",
        featuredLayout && "min-w-[260px] md:min-w-0"
      )}
    >
      <Link
        href={href}
        className="group mb-6 flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
      >
        {s.featured ? (
          <span className="mb-4 inline-block w-fit rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-violet-900 uppercase">
            Featured
          </span>
        ) : null}
        <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/6 transition-transform duration-300 group-hover:scale-[1.03]">
          <PremiumCategoryGlyph
            categoryId={s.category}
            catalog={catalog}
            iconClassName="size-7"
          />
        </div>
        <h3 className="mb-2 font-headline text-base font-bold leading-snug text-on-surface group-hover:text-primary">
          {s.name}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
          {s.description}
        </p>
        <p className="mt-3 text-xs text-on-surface-variant/90">
          {cat}
          <span className="text-on-surface-variant/50"> · </span>
          {bill}
          {s.seats ? (
            <>
              <span className="text-on-surface-variant/50"> · </span>
              {s.seats}
            </>
          ) : null}
        </p>
      </Link>
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-outline-variant/15 pt-6">
        <div>
          <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            From
          </span>
          <p className="font-headline text-2xl font-black tracking-tight text-on-surface tabular-nums">
            ${s.priceFrom.toFixed(2)}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-xl bg-primary px-6 py-3 font-headline text-sm font-bold tracking-wide text-white uppercase shadow-md shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Buy now
        </Link>
      </div>
    </article>
  );
}

export function ServicesView({
  variant = "full",
}: {
  variant?: ServicesViewVariant;
} = {}) {
  return (
    <CategoryIconProvider>
      <ServicesViewInner variant={variant} />
    </CategoryIconProvider>
  );
}
