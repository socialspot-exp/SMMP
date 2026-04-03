import Image from "next/image";
import {
  ArrowRight,
  CircleCheck,
  Gauge,
  MessageCircle,
  ShieldCheck,
  Star,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { FaAmazon } from "react-icons/fa6";
import { SiNetflix } from "react-icons/si";
import { DynamicBoostWord } from "@/components/home/dynamic-boost-word";
import {
  PLATFORM_GRID,
  PLATFORM_PILLS,
  SocialBrandIcon,
} from "@/components/home/social-brand";
import { DesktopSiteFooter } from "@/components/layout/desktop-site-footer";
import { HomeFloatingHeader } from "@/components/layout/home-floating-header";
import { cn } from "@/lib/utils";
import { HeroFlowingSocialIconsNoSSR } from "@/components/home/hero-flowing-social-icons-no-ssr";
import {
  AVATAR_HERO,
  AVATAR_TESTIMONIAL,
  FEATURED_PACKAGES,
  HOME_HERO,
  HOME_STATS,
  HOW_IT_WORKS,
  TESTIMONIAL,
  TRUST_BLOCK,
  VALUE_PROPS,
} from "@/lib/home-marketing-data";

const VALUE_ICONS = {
  gauge: Gauge,
  wallet: Wallet,
  star: Star,
} as const;

export function DesktopHome() {
  return (
    <>
      <HomeFloatingHeader />

      <main className="pt-[7.2rem]">
        <section className="relative mx-auto max-w-7xl overflow-hidden px-7 pt-8 pb-24 md:px-8 md:pt-10 md:pb-[8.4rem]">
          <HeroFlowingSocialIconsNoSSR count={15} sizeClass="h-9 w-9" colorMode="brand" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-[3.6rem] lg:grid-cols-2">
            <div className="z-10">
              <h1 className="mb-8 font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-on-surface md:text-7xl">
                {HOME_HERO.titleBefore}
                <span className="italic text-primary">{HOME_HERO.titleAccent}</span>{" "}
                {HOME_HERO.titleAfter}
              </h1>
              <p className="mb-12 max-w-lg text-lg leading-relaxed text-on-surface-variant md:text-xl">
                {HOME_HERO.subtitle}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  className="rounded-lg bg-primary px-8 py-4 text-lg font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]"
                >
                  {HOME_HERO.ctaPrimary}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-surface-container-lowest px-8 py-4 text-lg font-bold text-on-surface transition-colors hover:bg-surface-container"
                >
                  {HOME_HERO.ctaSecondary}
                </button>
              </div>
            </div>
            <div className="relative flex items-center justify-center lg:h-[600px]">
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />
              <div className="relative grid w-full max-w-md grid-cols-2 gap-5">
                <div className="space-y-5 pt-14">
                  {HOME_STATS.slice(0, 2).map((s) => {
                    const Icon = s.key === "growth" ? TrendingUp : ShieldCheck;
                    const color =
                      s.key === "growth" ? "text-primary" : "text-secondary";
                    return (
                      <div
                        key={s.key}
                        className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm transition-transform hover:translate-y-[-4px]"
                      >
                        <Icon
                          className={cn("mb-3 h-8 w-8", color)}
                          strokeWidth={2.25}
                          aria-hidden
                        />
                        <div className="font-headline text-xl font-bold">{s.value}</div>
                        <div className="text-xs text-on-surface-variant">{s.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-5">
                  {HOME_STATS.slice(2, 3).map((s) => (
                    <div
                      key={s.key}
                      className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm transition-transform hover:translate-y-[-4px]"
                    >
                      <Zap
                        className="mb-3 h-8 w-8 text-tertiary"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      <div className="font-headline text-xl font-bold">{s.value}</div>
                      <div className="text-xs text-on-surface-variant">{s.label}</div>
                    </div>
                  ))}
                  <div className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm transition-transform hover:translate-y-[-4px]">
                    <div className="-space-x-2 mb-3 flex">
                      {AVATAR_HERO.map((src, i) => (
                        <Image
                          key={i}
                          src={src}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full border-2 border-surface-container-lowest object-cover"
                        />
                      ))}
                    </div>
                    <div className="font-headline text-xl font-bold">
                      {HOME_STATS[3]!.value}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {HOME_STATS[3]!.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-10 text-center text-sm font-bold tracking-[0.2em] text-on-surface-variant uppercase">
              Supported Platforms
            </p>
            <div className="grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-8">
              {PLATFORM_GRID.map((p) => (
                <div key={p.label} className="group flex cursor-pointer flex-col items-center gap-2">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container-lowest shadow-sm transition-all ${p.tileHover}`}
                  >
                    <SocialBrandIcon
                      id={p.id}
                      className={`h-7 w-7 text-on-surface-variant transition-colors ${p.iconHover}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-headline text-4xl font-extrabold text-on-surface md:text-5xl">
                Boost Your Social Media Presence In Minutes!
              </h2>
              <h3 className="font-headline text-2xl font-bold text-on-surface md:text-3xl">
                Buy More <DynamicBoostWord />
              </h3>
              <p className="mt-4 text-on-surface-variant">
                Real followers, fast delivery, 24/7 support.
              </p>
            </div>

            <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLATFORM_PILLS.map((row) => (
                <div
                  key={row.label}
                  className="group flex min-w-0 cursor-pointer items-center gap-4 rounded-full border border-outline-variant/10 bg-surface p-1 pr-6 transition-shadow hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${row.circleClass}`}
                  >
                    <SocialBrandIcon id={row.id} className={row.iconClass} />
                  </div>
                  <span className="min-w-0 truncate font-headline font-bold text-on-surface transition-colors group-hover:text-primary">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <p className="mb-8 text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                As featured in
              </p>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
                <span className="font-headline text-xl font-black tracking-tighter">
                  BUSINESS INSIDER
                </span>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
                  <span className="font-headline text-xl font-black">DELIVERED SOCIAL</span>
                </div>
                <span className="font-headline text-xl font-semibold">GreeleyTribune</span>
                <span className="font-headline text-xl font-bold">
                  RoughDraft{" "}
                  <span className="-mt-1 block text-sm font-normal opacity-70">atlanta</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-4 font-headline text-4xl font-bold">Featured Growth Packages</h2>
              <p className="text-on-surface-variant">
                Premium social signals for rapid organic reach.
              </p>
            </div>
            <a className="flex items-center gap-2 font-bold text-primary transition-all hover:gap-3" href="#">
              View All <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PACKAGES.map((c) => (
              <div
                key={c.title}
                className="group rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-xl"
              >
                <div
                  className={`mb-12 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${c.wrap}`}
                >
                  <SocialBrandIcon id={c.brand} className="h-7 w-7 text-current" />
                </div>
                <h3 className="mb-2 font-headline text-xl font-bold">{c.title}</h3>
                <p className="mb-8 text-sm text-on-surface-variant">{c.desc}</p>
                <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase">
                      From
                    </span>
                    <span className="font-headline text-2xl font-black">{c.price}</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-all hover:bg-primary-dim active:scale-95"
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold tracking-widest text-secondary uppercase">
                Premium Inventory
              </span>
              <h2 className="mt-4 font-headline text-4xl font-bold">Elite Streaming Accounts</h2>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
              <div className="group relative overflow-hidden rounded-xl bg-surface-container-lowest p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E50914] to-[#B20710] opacity-0 transition-opacity group-hover:opacity-10" />
                <div className="relative p-10">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#E50914] text-white">
                      <SiNetflix className="h-9 w-9" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl font-extrabold">Netflix UHD</h3>
                      <p className="text-sm text-on-surface-variant">4 Screens + 4K Quality</p>
                    </div>
                  </div>
                  <ul className="mb-10 space-y-3">
                    {[
                      "Private Premium Account",
                      "Full 30-Day Warranty",
                      "Global Access (No VPN)",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-sm text-on-surface-variant">
                        <CircleCheck
                          className="size-5 shrink-0 text-green-500"
                          strokeWidth={2}
                          aria-hidden
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-3xl font-black">
                      $4.99
                      <span className="text-sm font-medium text-on-surface-variant">/mo</span>
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:shadow-lg active:scale-95"
                    >
                      Get Access
                    </button>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl bg-surface-container-lowest p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A8E1] to-[#007EA7] opacity-0 transition-opacity group-hover:opacity-10" />
                <div className="relative p-10">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#00A8E1] text-white">
                      <FaAmazon className="h-10 w-10" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl font-extrabold">Prime Video</h3>
                      <p className="text-sm text-on-surface-variant">Private Email Accounts</p>
                    </div>
                  </div>
                  <ul className="mb-10 space-y-3">
                    {[
                      "1 Year Membership",
                      "Fast Support Response",
                      "Multi-device Support",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-sm text-on-surface-variant">
                        <CircleCheck
                          className="size-5 shrink-0 text-green-500"
                          strokeWidth={2}
                          aria-hidden
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-3xl font-black">
                      $19.99
                      <span className="text-sm font-medium text-on-surface-variant">/yr</span>
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:shadow-lg active:scale-95"
                    >
                      Get Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-headline text-4xl font-bold">How It Works</h2>
            <p className="text-on-surface-variant">
              Simple three-step process to transform your social presence.
            </p>
          </div>
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="absolute top-1/2 left-0 -z-10 hidden h-px w-full bg-outline-variant/20 md:block" />
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary font-headline text-2xl font-black text-on-primary shadow-lg shadow-primary/30">
                  {step.n}
                </div>
                <h3 className="mb-3 font-headline text-xl font-bold">{step.t}</h3>
                <p className="leading-relaxed text-on-surface-variant">{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-low py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-3">
            {VALUE_PROPS.map((b) => {
              const Icon = VALUE_ICONS[b.iconKey];
              return (
                <div
                  key={b.title}
                  className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-10"
                >
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-lg ${b.accent}`}
                  >
                    <Icon className="h-8 w-8" strokeWidth={2} aria-hidden />
                  </div>
                  <h3 className="mb-4 font-headline text-2xl font-bold">{b.title}</h3>
                  <p className="leading-relaxed text-on-surface-variant">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="relative overflow-hidden rounded-xl bg-on-surface px-8 py-20 text-surface md:px-20">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
            <div className="relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div>
                <h2 className="mb-8 font-headline text-4xl leading-tight font-extrabold md:text-5xl">
                  {TRUST_BLOCK.headlineLead}
                  <span className="text-primary-container">{TRUST_BLOCK.headlineAccent}</span>
                  {TRUST_BLOCK.headlineTrail}
                </h2>
                <div className="flex gap-12">
                  <div>
                    <div className="mb-1 font-headline text-4xl font-black">
                      {TRUST_BLOCK.statAValue}
                    </div>
                    <div className="text-sm font-bold tracking-widest text-surface-dim uppercase">
                      {TRUST_BLOCK.statALabel}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-headline text-4xl font-black">
                      {TRUST_BLOCK.statBValue}
                    </div>
                    <div className="text-sm font-bold tracking-widest text-surface-dim uppercase">
                      {TRUST_BLOCK.statBLabel}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-xl border border-surface/10 bg-surface/10 p-8 backdrop-blur-md">
                  <p className="mb-6 text-lg italic">&quot;{TESTIMONIAL.quote}&quot;</p>
                  <div className="flex items-center gap-4">
                    <Image
                      src={AVATAR_TESTIMONIAL}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold">{TESTIMONIAL.name}</div>
                      <div className="text-xs text-primary-container">{TESTIMONIAL.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DesktopSiteFooter />
    </>
  );
}
