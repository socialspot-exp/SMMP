"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Ban,
  ChevronDown,
  Gauge,
  Headphones,
  Lock,
  Mail,
  MonitorSmartphone,
  Timer,
  UserCheck,
  Shield,
  Tv,
  Unlock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPremiumBentoItems,
  getPremiumDisplayPlans,
  getPremiumFaqs,
  getPremiumMobileQuickFaqs,
  getRelatedPremium,
  type PremiumDisplayPlan,
} from "@/lib/product-page-helpers";
import type { PremiumService } from "@/lib/services-data";
import { PREMIUM_BILLING, PREMIUM_CATEGORIES, PREMIUM_SERVICES } from "@/lib/services-data";
import { useCart } from "@/components/cart/cart-context";
import { PremiumBrandMark } from "@/components/product/premium-brand-mark";
import { ProductBreadcrumb } from "@/components/product/product-breadcrumb";
import { RatingStars } from "@/components/product/rating-stars";
import { PremiumCatalogIcon } from "@/lib/premium-catalog-icons";

const BENTO_ICONS = [Tv, MonitorSmartphone, Ban, Zap] as const;

type Props = {
  product: PremiumService;
  /** Full catalog for “related” rail; defaults to static seed. */
  catalog?: PremiumService[];
};

export function PremiumProductClient({ product: p, catalog = PREMIUM_SERVICES }: Props) {
  const router = useRouter();
  const { setPremiumLine } = useCart();
  const plans = useMemo(() => getPremiumDisplayPlans(p), [p]);
  const defaultId = plans.find((x) => x.featured)?.id ?? plans[0]?.id ?? "standard";
  const [planId, setPlanId] = useState(defaultId);
  const selected = plans.find((x) => x.id === planId) ?? plans[0]!;
  const related = useMemo(() => getRelatedPremium(p, 4, catalog), [p, catalog]);
  const faqs = useMemo(() => getPremiumFaqs(p), [p]);
  const mobileFaqs = useMemo(() => getPremiumMobileQuickFaqs(p), [p]);
  const bento = useMemo(() => getPremiumBentoItems(p.category), [p.category]);
  const cat = PREMIUM_CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category;
  const bill = PREMIUM_BILLING.find((b) => b.id === p.billing)?.label ?? p.billing;
  const [email, setEmail] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  function goToCart() {
    const em = email.trim();
    if (!emailOk(em)) {
      setCheckoutError("Enter a valid delivery email to continue.");
      return;
    }
    setCheckoutError(null);
    setPremiumLine({
      productId: p.id,
      productName: p.name,
      brandId: p.brandId,
      planId: selected.id,
      planSummary: `${selected.headline} — ${selected.sub}`,
      price: selected.price,
      deliveryEmail: em,
    });
    router.push("/cart");
  }

  const initial = p.name.trim().charAt(0).toUpperCase() || "P";
  const headlineAccent =
    p.category === "streaming"
      ? "Redefined."
      : p.category === "music"
        ? "Unlocked."
        : p.category === "gaming"
          ? "Leveled up."
          : p.category === "productivity"
            ? "Simplified."
            : "Secured.";

  const flowSteps = useMemo(() => {
    if (p.billing === "one-time") {
      return [
        { n: "1", t: "Select access", d: "Choose this one-time premium entitlement." },
        { n: "2", t: "Enter delivery email", d: "We send credentials and setup steps there." },
        { n: "3", t: "Receive & use", d: "Log in or redeem instantly after payment." },
      ];
    }
    return [
      {
        n: "1",
        t: "Choose duration",
        d: "Pick monthly, multi-month, or annual — prices update in the card.",
      },
      {
        n: "2",
        t: "Enter delivery email",
        d: "Provide the inbox where you want credentials or invites.",
      },
      {
        n: "3",
        t: "Receive & enjoy",
        d: "Get login details fast and start using your entitlement.",
      },
    ];
  }, [p.billing]);

  const mobileFlowSteps = [
    { n: "1", t: "Select package", d: "Choose the duration that fits your needs." },
    { n: "2", t: "Instant checkout", d: "Pay through our secure gateway." },
    { n: "3", t: "Check email", d: "Logins and instructions arrive automatically." },
  ];

   const seoLead = useMemo(() => {
    return `At Curator Market, we curate high-tier digital assets for discerning users. ${p.name} is selected for stability and clear delivery — you get more than a login: structured handoff, support, and terms that match what you purchased.`;
  }, [p.name]);

  const topFeatures = useMemo(() => {
    const custom = p.topFeatures ?? [];
    if (custom.length > 0) return custom;
    // Fallback: replace the previous “Features” block copy.
    return [
      {
        iconKey: "Sparkles",
        title: "Encrypted & secure transaction",
        description: "SSL-protected checkout and clear delivery records.",
      },
    ];
  }, [p.topFeatures]);

  const nonFeaturedPlans = plans.filter((pl) => !pl.featured);
  const featuredPlan = plans.find((pl) => pl.featured);

  return (
    <>
      {/* Desktop */}
      <div className="hidden pb-20 lg:block">
        <main className="mx-auto max-w-7xl px-6 pt-8 pb-12">
          <ProductBreadcrumb
            className="mb-10"
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services#premium-services" },
              { label: "Premium" },
              { label: p.name },
            ]}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-center">
                <PremiumBrandMark
                  brandId={p.brandId}
                  productName={p.name}
                  fallbackLetter={initial}
                />
                <div className="min-w-0">
                  <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
                    {p.name}
                  </h1>
                </div>
              </div>

              <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-2">
                {bento.map((item, i) => {
                  const Icon = BENTO_ICONS[i] ?? Zap;
                  return (
                    <div
                      key={item.title}
                      className="ghost-border flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-8"
                    >
                      <Icon className="h-9 w-9 text-primary" strokeWidth={1.75} aria-hidden />
                      <h3 className="font-headline text-xl font-bold text-on-surface">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
                    </div>
                  );
                })}
              </div>

              <section className="mb-16">
                <h2 className="mb-8 font-headline text-2xl font-extrabold text-on-surface">
                  Digital delivery flow
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  {flowSteps.map((step) => (
                    <div key={step.n} className="flex flex-col items-center gap-4 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-headline text-lg font-bold text-on-primary">
                        {step.n}
                      </div>
                      <h4 className="font-bold text-on-surface">{step.t}</h4>
                      <p className="text-xs text-on-surface-variant">{step.d}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="max-w-none">
                <h2 className="mb-6 font-headline text-3xl font-extrabold text-on-surface">
                  The ultimate experience
                </h2>
                <p className="mb-6 leading-relaxed text-on-surface-variant">{seoLead}</p>
                <p className="mb-8 leading-relaxed text-on-surface-variant">{p.description}</p>
                {p.longDescription ? (
                  <p className="mb-8 whitespace-pre-wrap leading-relaxed text-on-surface-variant">
                    {p.longDescription}
                  </p>
                ) : null}
                <h3 className="mb-4 font-headline text-xl font-bold text-on-surface">
                  Why choose our premium accounts?
                </h3>
                <p className="mb-8 leading-relaxed text-on-surface-variant">
                  Unlike generic marketplaces, we verify sources and deliver fast — seconds, not hours.
                  {p.topReview ? ` Buyers note: “${p.topReview}”` : ""}
                </p>

                <div className="space-y-4">
                  {faqs.map((item, i) => (
                    <details
                      key={item.q}
                      className="group rounded-xl bg-surface-container-low p-6"
                      open={i === 0}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-on-surface [&::-webkit-details-marker]:hidden">
                        <span>{item.q}</span>
                        <ChevronDown className="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>

              <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-on-surface-variant">
                <span className="rounded-lg bg-surface-container px-3 py-1">{cat}</span>
                <span className="rounded-lg bg-surface-container px-3 py-1">{bill}</span>
                {p.seats ? (
                  <span className="rounded-lg bg-surface-container px-3 py-1">{p.seats}</span>
                ) : null}
                {p.featured ? (
                  <span className="rounded-lg bg-secondary/15 px-3 py-1 text-secondary">Featured</span>
                ) : null}
              </div>

              {related.length > 0 ? (
                <section className="mt-14 border-t border-outline-variant/10 pt-12">
                  <h2 className="mb-6 font-headline text-xl font-bold text-on-surface">
                    You may also like
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {related.map((r) => (
                      <PremiumRelatedCard key={r.id} service={r} />
                    ))}
                  </div>
                </section>
              ) : null}

              {related.length > 0 ? (
                <section className="bg-background py-20">
                  <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                      {[
                        {
                          icon: Timer,
                          title: "Instant delivery",
                          body: "Keys and access arrive quickly after checkout.",
                          ring: "bg-blue-50 text-blue-600",
                        },
                        {
                          icon: UserCheck,
                          title: "High retention",
                          body: "Replacements and coverage when supported plans need it.",
                          ring: "bg-green-50 text-green-600",
                        },
                        {
                          icon: Headphones,
                          title: "24/7 support",
                          body: "Real help for access issues and credential handoff.",
                          ring: "bg-purple-50 text-purple-600",
                        },
                        {
                          icon: Lock,
                          title: "Encrypted & secure transaction",
                          body: "SSL-protected checkout and clear delivery records.",
                          ring: "bg-orange-50 text-orange-600",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-8 text-center ambient-shadow"
                        >
                          <div
                            className={[
                              "mb-6 flex h-16 w-16 items-center justify-center rounded-full",
                              item.ring,
                            ].join(" ")}
                          >
                            <item.icon className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                          </div>
                          <h4 className="mb-2 font-headline font-bold text-on-surface">
                            {item.title}
                          </h4>
                          <p className="text-sm text-on-surface-variant">{item.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="ghost-border rounded-xl bg-surface-container-lowest p-8 ambient-shadow">
                  <h3 className="mb-6 font-headline text-xl font-bold text-on-surface">
                    Service configuration
                  </h3>
                  <div className="mb-8">
                    <label className="mb-4 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Select plan duration
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {plans.map((pl) => (
                        <DesktopPlanRow
                          key={pl.id}
                          plan={pl}
                          selected={planId === pl.id}
                          onSelect={() => setPlanId(pl.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="premium-email-desktop"
                      className="mb-4 block text-xs font-bold tracking-widest text-on-surface-variant uppercase"
                    >
                      Delivery email address
                    </label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-outline"
                        aria-hidden
                      />
                      <input
                        id="premium-email-desktop"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full rounded-xl border-none bg-surface-container-low py-4 pr-4 pl-12 text-on-surface transition-all outline-none placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="mt-2 px-1 text-[10px] text-on-surface-variant">
                      Your credentials will be sent here immediately after purchase.
                    </p>
                  </div>
                  {checkoutError ? (
                    <p className="text-sm font-medium text-error" role="alert">
                      {checkoutError}
                    </p>
                  ) : null}
                  <Button
                    className="h-auto w-full rounded-xl py-5 font-headline text-lg font-extrabold shadow-lg shadow-primary/20"
                    size="lg"
                    type="button"
                    onClick={goToCart}
                  >
                    Buy now
                    <ArrowRight className="ml-1 h-5 w-5" aria-hidden />
                  </Button>
                </div>

                <div className="space-y-4 rounded-xl bg-surface-container-low p-6">
                  {topFeatures.map((tf, i) => (
                    <div key={`${tf.title}-${i}`} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <PremiumCatalogIcon
                          name={tf.iconKey}
                          className="size-6 stroke-[1.75]"
                        />
                      </div>
                      <div className="text-sm">
                        <div className="font-bold text-on-surface">{tf.title}</div>
                        {tf.description ? (
                          <div className="text-xs text-on-surface-variant">{tf.description}</div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="px-4 pb-4">
          <Link
            href="/services#premium-services"
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            Back to services
          </Link>
        </div>

        <section className="bg-surface-container-lowest px-6 pt-6 pb-6">
          <div className="mb-4 flex items-center gap-3">
            <PremiumBrandMark
              brandId={p.brandId}
              productName={p.name}
              fallbackLetter={initial}
            />
            <div>
              <h1 className="font-headline text-4xl leading-tight font-extrabold tracking-tight text-on-surface">
                {p.name}
              </h1>
            </div>
          </div>
          <p className="mb-6 text-base leading-relaxed text-on-surface-variant">{p.description}</p>
          {p.longDescription ? (
            <p className="mb-6 whitespace-pre-wrap text-base leading-relaxed text-on-surface-variant">
              {p.longDescription}
            </p>
          ) : null}
        </section>

        <section className="px-6 py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {topFeatures.map((tf, i) => (
              <div
                key={`${tf.title}-${i}`}
                className="flex items-start gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PremiumCatalogIcon name={tf.iconKey} className="h-6 w-6 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold text-on-surface">{tf.title}</h3>
                  {tf.description ? (
                    <p className="text-sm text-on-surface-variant">{tf.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-low px-6 py-8">
          <div className="mb-6 flex items-center justify-between gap-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Select plan</h2>
            <span className="text-xs font-semibold text-primary">Best value guaranteed</span>
          </div>
          <div className="flex flex-col gap-4">
            {featuredPlan ? (
              <button
                type="button"
                onClick={() => setPlanId(featuredPlan.id)}
                className={cn(
                  "relative rounded-xl border-2 bg-surface-container-lowest p-6 text-left shadow-lg transition-all",
                  planId === featuredPlan.id ? "border-primary" : "border-outline-variant/30"
                )}
              >
                {plans.length > 1 ? (
                  <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 font-headline text-[10px] font-bold tracking-widest text-white uppercase">
                    Best choice
                  </div>
                ) : null}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{featuredPlan.headline}</h3>
                    <p className="text-xs text-on-surface-variant">{featuredPlan.sub}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-headline text-2xl font-black text-primary">
                      ${featuredPlan.price.toFixed(2)}
                    </span>
                    {featuredPlan.compareAt ? (
                      <span className="block text-[10px] text-on-surface-variant line-through">
                        ${featuredPlan.compareAt.toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
                    {p.seats ?? "Multi-device access (see listing)"}
                  </li>
                  <li className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
                    Premium quality &amp; support window
                  </li>
                </ul>
              </button>
            ) : (
              plans.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setPlanId(pl.id)}
                  className={cn(
                    "rounded-xl border bg-surface-container-lowest p-6 text-left shadow-sm transition-all",
                    planId === pl.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-outline-variant/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold capitalize text-on-surface">{pl.headline}</h3>
                      <p className="text-xs text-on-surface-variant">{pl.sub}</p>
                    </div>
                    <span className="font-headline text-xl font-bold text-primary">
                      ${pl.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))
            )}
            {featuredPlan
              ? nonFeaturedPlans.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => setPlanId(pl.id)}
                    className={cn(
                      "rounded-xl border bg-surface-container-lowest p-6 text-left shadow-sm transition-all",
                      planId === pl.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-outline-variant/20 opacity-90"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold capitalize text-on-surface">{pl.headline}</h3>
                        <p className="text-xs text-on-surface-variant">{pl.sub}</p>
                      </div>
                      <div className="text-right">
                        <span className="block font-headline text-xl font-bold text-on-surface">
                          ${pl.price.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-on-surface-variant">
                          {p.billing === "monthly" && pl.id === "1m"
                            ? "per month"
                            : p.billing === "yearly" && pl.id === "1m"
                              ? "short term"
                              : "plan"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              : null}
          </div>
        </section>

        <section className="bg-surface-container-lowest px-6 py-8">
          <h2 className="mb-6 font-headline text-xl font-bold text-on-surface">Account delivery</h2>
          <div>
            <label
              htmlFor="premium-email-mobile"
              className="mb-2 block font-label text-xs font-bold tracking-wider text-on-surface-variant uppercase"
            >
              Delivery email
            </label>
            <div className="relative">
              <input
                id="premium-email-mobile"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-4 pr-12 text-on-surface transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
              />
              <Mail className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            </div>
            <p className="mt-2 text-[10px] leading-tight text-on-surface-variant">
              Your credentials will be sent to this email immediately after payment.
            </p>
          </div>
        </section>

        <section className="bg-surface px-6 py-8">
          <h2 className="mb-8 text-center font-headline text-xl font-bold text-on-surface">
            How it works
          </h2>
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-primary/20" />
            <div className="space-y-12">
              {mobileFlowSteps.map((step) => (
                <div key={step.n} className="relative flex gap-6 pl-2">
                  <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md">
                    {step.n}
                  </div>
                  <div>
                    <h4 className="mb-1 font-bold text-on-surface">{step.t}</h4>
                    <p className="text-sm text-on-surface-variant">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest px-6 py-8">
          <h2 className="mb-6 font-headline text-xl font-bold text-on-surface">Questions?</h2>
          <div className="space-y-4">
            {mobileFaqs.map((item) => (
              <div key={item.q} className="rounded-xl bg-surface p-4">
                <h4 className="mb-2 text-sm font-bold text-on-surface">{item.q}</h4>
                <p className="text-xs text-on-surface-variant">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 ? (
          <>
            <section className="px-6 py-6">
              <h3 className="mb-3 font-headline text-lg font-bold">You may also like</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <PremiumRelatedCard key={r.id} service={r} />
                ))}
              </div>
            </section>

            <section className="bg-background px-6 py-16">
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    icon: Timer,
                    title: "Instant delivery",
                    body: "Keys and access arrive quickly after checkout.",
                    ring: "bg-blue-50 text-blue-600",
                  },
                  {
                    icon: UserCheck,
                    title: "High retention",
                    body: "Replacements and coverage when supported plans need it.",
                    ring: "bg-green-50 text-green-600",
                  },
                  {
                    icon: Headphones,
                    title: "24/7 support",
                    body: "Real help for access issues and credential handoff.",
                    ring: "bg-purple-50 text-purple-600",
                  },
                  {
                    icon: Lock,
                    title: "Encrypted & secure transaction",
                    body: "SSL-protected checkout and clear delivery records.",
                    ring: "bg-orange-50 text-orange-600",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm"
                  >
                    <div
                      className={[
                        "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                        item.ring,
                      ].join(" ")}
                    >
                      <item.icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h4 className="mb-2 font-headline font-bold text-on-surface">{item.title}</h4>
                    <p className="text-xs text-on-surface-variant">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>

      {/* Sticky mobile CTA above tab bar */}
      <div
        className="fixed right-0 left-0 z-40 border-t border-outline-variant/10 bg-white/70 px-6 py-4 backdrop-blur-md lg:hidden"
        style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {checkoutError ? (
          <p className="mb-2 text-center text-xs font-medium text-error" role="alert">
            {checkoutError}
          </p>
        ) : null}
        <Button
          className="group/buy h-auto w-full rounded-xl py-4 font-headline text-base font-bold shadow-xl shadow-primary/20"
          size="lg"
          type="button"
          onClick={goToCart}
        >
          Proceed to checkout
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/buy:translate-x-1" />
        </Button>
      </div>
    </>
  );
}

function DesktopPlanRow({
  plan,
  selected,
  onSelect,
}: {
  plan: PremiumDisplayPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "ghost-border hover:bg-surface-container-low"
      )}
    >
      <div>
        <div className="font-bold text-on-surface capitalize">{plan.headline}</div>
        <div className="text-xs text-on-surface-variant">{plan.sub}</div>
      </div>
      <div
        className={cn(
          "font-headline text-lg font-bold",
          selected ? "text-primary" : "text-on-surface"
        )}
      >
        ${plan.price.toFixed(2)}
      </div>
    </button>
  );
}

function PremiumRelatedCard({ service }: { service: PremiumService }) {
  const href = `/services/premium/${service.id}`;
  const cat = PREMIUM_CATEGORIES.find((c) => c.id === service.category)?.label ?? service.category;
  const iconName = service.iconKey ?? "Sparkles";

  return (
    <Link
      href={href}
      className="group flex h-full min-h-[260px] flex-col rounded-2xl border border-outline-variant/12 bg-surface-container-lowest p-6 shadow-[0_8px_32px_-12px_rgba(44,47,50,0.14)] transition-shadow duration-300 hover:shadow-[0_14px_44px_-16px_rgba(44,47,50,0.2)]"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <PremiumCatalogIcon name={iconName} className="h-6 w-6 stroke-[1.75]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            {cat}
          </p>
          <h3 className="mt-0.5 line-clamp-1 font-headline text-sm font-bold text-on-surface group-hover:text-primary">
            {service.name}
          </h3>
        </div>
      </div>

      <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-on-surface-variant">
        {service.description}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              From
            </span>
            <span className="font-headline text-2xl font-black tracking-tight text-primary tabular-nums">
              ${service.priceFrom.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <span className="block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-xs font-bold uppercase text-white shadow-md shadow-primary/25 transition-transform group-hover:scale-[1.01] active:scale-[0.98]">
            Buy now
          </span>
        </div>
      </div>
    </Link>
  );
}
