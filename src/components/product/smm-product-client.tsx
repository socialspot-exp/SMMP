"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Bolt,
  Check,
  ChevronDown,
  Headphones,
  Link2,
  Lock,
  Rocket,
  Timer,
  TrendingUp,
  Unlock,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  SocialBrandIcon,
  SOCIAL_BRAND_ICON_COLORS,
} from "@/components/home/social-brand";
import { SmmCard } from "@/components/services/smm-service-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getRelatedSmm,
  getSmmDisplayTiers,
  getSmmFaqs,
  getSmmFeatures,
  type SmmDisplayTier,
} from "@/lib/product-page-helpers";
import type { SMMService } from "@/lib/services-data";
import { SMM_PLATFORMS, SMM_SERVICES } from "@/lib/services-data";
import { useCart } from "@/components/cart/cart-context";
import { ProductBreadcrumb } from "@/components/product/product-breadcrumb";

type Props = {
  product: SMMService;
  /** Full active catalog for related products (defaults to static seed). */
  catalog?: SMMService[];
};

function tierLine(t: SmmDisplayTier) {
  return `${t.qtyLabel} ${t.unitWord}`;
}

function defaultTierIdForProduct(product: SMMService): string {
  const t = getSmmDisplayTiers(product);
  if (t.length === 0) return "";
  const pop = t.findIndex((x) => x.popular);
  return (pop >= 0 ? t[pop] : t[0])!.id;
}

export function SmmProductClient({ product: p, catalog: catalogProp }: Props) {
  const router = useRouter();
  const { setSmmLine } = useCart();
  const catalog = catalogProp ?? SMM_SERVICES;
  const tiers = useMemo(() => getSmmDisplayTiers(p), [p]);
  const [tierId, setTierId] = useState(() => defaultTierIdForProduct(p));
  useEffect(() => {
    setTierId(defaultTierIdForProduct(p));
  }, [
    p.id,
    p.slug,
    p.category,
    p.priceFrom,
    JSON.stringify(p.quantityOptions ?? []),
  ]);
  const selected = tiers.find((t) => t.id === tierId) ?? tiers[1] ?? tiers[0]!;
  const related = useMemo(() => getRelatedSmm(p, 4, catalog), [p, catalog]);
  const faqs = useMemo(() => getSmmFaqs(p), [p]);
  const productFeatures = useMemo(() => getSmmFeatures(p), [p]);
  const qtyLimitsLine =
    p.orderQtyMin != null || p.orderQtyMax != null
      ? `Per-order quantity: ${p.orderQtyMin != null ? p.orderQtyMin.toLocaleString("en-US") : "—"} – ${p.orderQtyMax != null ? p.orderQtyMax.toLocaleString("en-US") : "—"}`
      : null;
  const platformLabel =
    SMM_PLATFORMS.find((x) => x.id === p.platform)?.label ?? p.platform;
  const desktopLinkLabel =
    p.checkoutFieldLabel?.trim() || `${platformLabel} profile URL`;
  const mobileLinkSectionTitle =
    p.checkoutFieldLabel?.trim() || "Account details";
  const linkUrlPlaceholder = `https://${p.platform === "x" ? "x.com" : `${p.platform}.com`}/username`;
  const [profileUrl, setProfileUrl] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  function goToCart() {
    const u = profileUrl.trim();
    if (!u) {
      setCheckoutError(`Enter ${desktopLinkLabel.toLowerCase()} to continue.`);
      return;
    }
    setCheckoutError(null);
    setSmmLine({
      productId: p.id,
      productName: p.name,
      platform: p.platform,
      tierId: selected.id,
      tierSummary: `${tierLine(selected)} · ${selected.badge}`,
      price: selected.price,
      profileUrl: u,
    });
    router.push("/cart");
  }

  const longLead = useMemo(() => {
    return `In the fast-paced world of digital curation, social proof isn't just a vanity metric—it's your digital handshake. ${p.name} is built for creators, brands, and teams who want high-retention, organic-looking signals that fit how real audiences grow.`;
  }, [p.name]);

  return (
    <>
      {/* ——— Desktop (reference layout) ——— */}
      <div className="hidden pb-20 lg:block px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <section className="mx-auto w-full max-w-7xl bg-background pt-2 lg:pt-4">
          <ProductBreadcrumb
            className="mb-5"
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services#smm-services" },
              { label: "SMM" },
              { label: p.name },
            ]}
          />
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="mb-6">
                <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface md:text-5xl">
                  {p.name}
                </h1>
              </div>

              <div className="mb-8 rounded-3xl border border-outline-variant/10 bg-background py-10">
                <div className="flex flex-col items-center px-4">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/6">
                    <SocialBrandIcon
                      id={p.platform}
                      className={cn("h-16 w-16", SOCIAL_BRAND_ICON_COLORS[p.platform])}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-5 max-w-md text-center font-headline text-base font-semibold text-on-surface md:text-lg">
                    Skyrocket your presence with authentic growth.
                  </p>
                </div>
              </div>

              <div className="space-y-8 pr-0 lg:pr-4">
                <div className="space-y-4">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">
                    Why choose Curator Market for {platformLabel}?
                  </h2>
                  {p.longDescription?.trim() ? (
                    <p className="leading-relaxed whitespace-pre-wrap text-on-surface-variant">
                      {p.longDescription.trim()}
                    </p>
                  ) : (
                    <p className="leading-relaxed text-on-surface-variant">{longLead}</p>
                  )}
                  <p className="leading-relaxed text-on-surface-variant">{p.description}</p>
                </div>
                {productFeatures.length > 0 ? (
                  <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
                    <p className="mb-3 text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                      Included
                    </p>
                    <ul className="space-y-2.5">
                      {productFeatures.map((text, i) => (
                        <li
                          key={`main-${i}-${text.slice(0, 24)}`}
                          className="flex gap-2.5 text-sm text-on-surface"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-green-600"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
                    <h3 className="mb-2 flex items-center gap-2 font-headline font-bold text-primary">
                      <Zap className="h-5 w-5" aria-hidden />
                      How it works
                    </h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      Select your package, enter your profile URL, and we begin delivery. Drip-feed
                      options keep growth looking natural to platform signals.
                    </p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
                    <h3 className="mb-2 flex items-center gap-2 font-headline font-bold text-secondary">
                      <Rocket className="h-5 w-5" aria-hidden />
                      Platform benefits
                    </h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      Stronger signals can improve discovery and trust. Pair boosts with quality
                      content for compounding organic reach.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-8 shadow-sm">
                  <h3 className="mb-6 font-headline text-xl font-bold text-on-surface">
                    Configure your package
                  </h3>
                  <div className="mb-8 grid grid-cols-2 gap-4">
                    {tiers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTierId(t.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all",
                          tierId === t.id
                            ? "border-primary bg-background shadow-sm"
                            : "border-outline-variant/25 bg-background/80 hover:border-primary/50"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-bold tracking-widest uppercase",
                            tierId === t.id ? "text-primary" : "text-on-surface-variant"
                          )}
                        >
                          {t.badge}
                        </span>
                        <span className="text-lg font-bold text-on-surface">{t.qtyLabel}</span>
                        <span className="text-sm font-medium text-on-surface-variant">
                          ${t.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="smm-profile-desktop"
                        className="mb-2 block font-label text-sm font-bold text-on-surface-variant"
                      >
                        {desktopLinkLabel}
                      </label>
                      <div className="relative">
                        <Link2
                          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-outline"
                          aria-hidden
                        />
                        <input
                          id="smm-profile-desktop"
                          value={profileUrl}
                          onChange={(e) => setProfileUrl(e.target.value)}
                          className="w-full rounded-xl border border-outline-variant/15 bg-background py-3.5 pr-4 pl-12 text-sm text-on-surface transition-all outline-none focus:border-primary focus:ring-0"
                          placeholder={linkUrlPlaceholder}
                          type="url"
                          autoComplete="url"
                          suppressHydrationWarning
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/90 p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-on-surface-variant">Selected package</span>
                        <span className="text-sm font-bold text-on-surface">{tierLine(selected)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-headline text-lg font-extrabold text-on-surface">
                          Total price
                        </span>
                        <span className="font-headline text-2xl font-black text-primary">
                          ${selected.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {checkoutError ? (
                      <p className="text-sm font-medium text-error" role="alert">
                        {checkoutError}
                      </p>
                    ) : null}
                    <Button
                      className="h-auto w-full rounded-xl py-4 font-headline text-lg font-bold shadow-lg shadow-primary/20"
                      size="lg"
                      type="button"
                      onClick={goToCart}
                    >
                      Buy now
                      <ArrowRight className="ml-1 h-5 w-5" aria-hidden />
                    </Button>
                    <p className="flex items-center justify-center gap-2 text-center text-xs text-on-surface-variant">
                      <Lock className="h-4 w-4 shrink-0" aria-hidden />
                      Encrypted &amp; secure transaction
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {related.length > 0 ? (
            <section className="mt-14 border-t border-outline-variant/10 pt-12">
              <h2 className="mb-6 font-headline text-xl font-bold text-on-surface">
                You may also like
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {related.map((r) => (
                  <SmmCard key={r.id} service={r} />
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <section className="bg-background py-20">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                {
                  icon: Timer,
                  title: "Instant delivery",
                  body: "Orders typically start within minutes of confirmation.",
                  ring: "bg-blue-50 text-blue-600",
                },
                {
                  icon: UserCheck,
                  title: "High retention",
                  body: "Refill windows on eligible tiers keep numbers consistent.",
                  ring: "bg-green-50 text-green-600",
                },
                {
                  icon: Headphones,
                  title: "24/7 support",
                  body: "Real humans when you need help with an order.",
                  ring: "bg-purple-50 text-purple-600",
                },
                {
                  icon: Unlock,
                  title: "No password",
                  body: "We only need your public profile link for most packages.",
                  ring: "bg-red-50 text-red-600",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-8 text-center ambient-shadow"
                >
                  <div
                    className={cn(
                      "mb-6 flex h-16 w-16 items-center justify-center rounded-full",
                      item.ring
                    )}
                  >
                    <item.icon className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h4 className="mb-2 font-headline font-bold text-on-surface">{item.title}</h4>
                  <p className="text-sm text-on-surface-variant">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl py-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-headline text-3xl font-extrabold text-on-surface">
              Common questions
            </h2>
            <p className="text-on-surface-variant">
              Everything you need to know about ordering on Curator Market.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <details
                key={`${i}-${item.q.slice(0, 48)}`}
                className="group overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest"
                open={i === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-headline font-bold text-on-surface [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-on-surface-variant">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* ——— Mobile (reference layout) ——— */}
      <div className="px-5 pb-4 sm:px-6 lg:hidden">
        <Link
          href="/services#smm-services"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Back to services
        </Link>

        <section className="space-y-4">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {p.name}
          </h2>
          <div className="rounded-2xl border border-outline-variant/10 bg-background p-6">
            <div className="flex flex-col items-center py-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/6">
                <SocialBrandIcon
                  id={p.platform}
                  className={cn("h-12 w-12", SOCIAL_BRAND_ICON_COLORS[p.platform])}
                  aria-hidden
                />
              </div>
            </div>
            <p className="mt-3 text-center font-headline text-sm font-semibold text-on-surface">
              Skyrocket your presence with authentic growth.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-6 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-2">
              <label className="font-headline text-lg font-bold">Configure your package</label>
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                Organic quality
              </span>
            </div>
            <div className="flex flex-col gap-3">
            {tiers.map((t) => (
                <label key={t.id} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="smm-package"
                    className="peer sr-only"
                    checked={tierId === t.id}
                    onChange={() => setTierId(t.id)}
                  />
                  <div className="flex items-center justify-between rounded-xl border-2 border-transparent bg-background p-4 shadow-sm transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-on-surface">{tierLine(t)}</span>
                        {t.popular ? (
                          <span className="rounded bg-secondary-container px-2 py-0.5 font-headline text-[10px] font-bold text-on-secondary-container">
                            POPULAR
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-on-surface-variant">{t.mobileSubtitle}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="block font-headline text-lg font-bold text-primary">
                        ${t.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-on-surface-variant line-through">
                        ${t.compareAt.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="smm-profile-mobile"
              className="font-headline text-lg font-bold"
            >
              {mobileLinkSectionTitle}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                <AtSign className="h-5 w-5" aria-hidden />
              </div>
              <input
                id="smm-profile-mobile"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/15 bg-background py-4 pr-4 pl-12 font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
                placeholder={linkUrlPlaceholder}
                type="text"
                autoComplete="username"
                suppressHydrationWarning
              />
            </div>
            <p className="px-1 text-[11px] text-on-surface-variant">
              Ensure your account is <span className="font-bold text-on-surface">public</span> before
              ordering.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-6 pt-4">
          <h3 className="text-center font-headline text-2xl font-extrabold tracking-tight">
            Why choose us
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bolt className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h4 className="text-sm font-bold">Instant delivery</h4>
                <p className="mt-1 text-xs text-on-surface-variant">Starts within minutes of payment.</p>
              </div>
            </div>
            <div className="space-y-3 rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCheck className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h4 className="text-sm font-bold">Safe &amp; secure</h4>
                <p className="mt-1 text-xs text-on-surface-variant">No password ever required.</p>
              </div>
            </div>
          </div>
        </section>

        {productFeatures.length > 0 ? (
          <section className="mt-8">
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
              <p className="mb-3 text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                Included
              </p>
              <ul className="space-y-2">
                {productFeatures.map((text, i) => (
                  <li
                    key={`m-features-${i}-${text.slice(0, 20)}`}
                    className="flex gap-2 text-sm text-on-surface"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-green-600"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="mt-8 space-y-6">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight">How it works</h3>
          <div className="space-y-4">
            {[
              {
                n: "1",
                t: "Select your package",
                d: "Choose the volume that matches your growth goals.",
              },
              {
                n: "2",
                t: "Enter details",
                d: "Add your username or profile link. Privacy comes first.",
              },
              {
                n: "3",
                t: "Watch it grow",
                d: "We deliver while you focus on content.",
              },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {step.n}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-on-surface">{step.t}</h4>
                  <p className="text-sm text-on-surface-variant">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mt-8">
            <h3 className="mb-4 font-headline text-lg font-bold">You may also like</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <SmmCard key={r.id} service={r} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-8 space-y-4">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight">Questions?</h3>
          <div className="space-y-2">
            {faqs.slice(0, 4).map((item, i) => (
              <details
                key={`m-${i}-${item.q.slice(0, 48)}`}
                className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-bold [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 text-sm leading-relaxed text-on-surface-variant">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile sticky CTA — above bottom tab bar */}
      <div
        className="fixed right-0 left-0 z-40 border-t border-outline-variant/15 bg-background/95 px-4 pt-4 pb-4 shadow-[0_-10px_40px_-10px_rgba(44,47,50,0.08)] backdrop-blur-xl lg:hidden"
        style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2">
          {checkoutError ? (
            <p className="text-center text-xs font-medium text-error" role="alert">
              {checkoutError}
            </p>
          ) : null}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Total price
              </span>
              <span className="font-headline text-2xl font-extrabold text-primary">
                ${selected.price.toFixed(2)}
              </span>
            </div>
            <Button
              className="h-auto min-h-12 flex-1 rounded-xl py-4 font-headline text-lg font-bold shadow-lg shadow-primary/20"
              size="lg"
              type="button"
              onClick={goToCart}
            >
              <span>Buy now</span>
              <TrendingUp className="ml-1 h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
