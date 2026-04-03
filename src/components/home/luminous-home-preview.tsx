import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  MessageCircle,
  PenLine,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { DynamicBoostWord } from "@/components/home/dynamic-boost-word";
import { PLATFORM_GRID, SocialBrandIcon } from "@/components/home/social-brand";
import {
  AVATAR_TESTIMONIAL,
  BENTO_ANALYTICS_IMAGE,
  FEATURED_PACKAGES,
  HOME_HERO,
  HOME_STATS,
  LUMINOUS_HERO_IMAGE,
  TESTIMONIAL,
  TRUST_BLOCK,
  VALUE_PROPS,
} from "@/lib/home-marketing-data";
import { cn } from "@/lib/utils";

/** Luminous editorial tokens (from reference HTML) — scoped to this preview */
const L = {
  primary: "#f97f24",
  onPrimaryC: "#3d1800",
  tertiary: "#fdc02a",
  onTertiaryC: "#563e00",
  inverse: "#0c0f10",
  bg: "#f5f6f7",
  surfaceLow: "#eff1f2",
  surfaceLowest: "#ffffff",
  outlineVar: "#abadae",
} as const;

export function LuminousHomePreview() {
  const growthStat = HOME_STATS.find((s) => s.key === "growth")!;

  return (
    <div
      className="min-h-screen text-[#2c2f30] antialiased selection:bg-[#f97f24] selection:text-[#3d1800]"
      style={{ backgroundColor: L.bg }}
    >
      {/* Floating nav — Luminous pattern; links match main site IA */}
      <nav
        className="fixed top-5 left-1/2 z-50 flex w-[min(92%,72rem)] -translate-x-1/2 items-center justify-between rounded-full border border-black/5 px-5 py-2.5 shadow-2xl shadow-black/5 backdrop-blur-md sm:px-8 sm:py-3"
        style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
      >
        <Link
          href="/"
          className="font-headline text-xl font-black tracking-tighter text-[#2c2f30] sm:text-2xl"
        >
          Curator Market
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="font-headline text-sm font-medium tracking-tight text-[#595c5f] transition-colors hover:text-[#f97f24]"
          >
            Marketplace
          </Link>
          <Link
            href="/services"
            className="border-b-2 border-[#f97f24] pb-1 font-headline text-sm font-bold tracking-tight text-[#f97f24]"
          >
            Services
          </Link>
          <span className="cursor-default font-headline text-sm font-medium tracking-tight text-[#595c5f]/60">
            Growth
          </span>
          <span className="cursor-default font-headline text-sm font-medium tracking-tight text-[#595c5f]/60">
            Reviews
          </span>
        </div>
        <Link
          href="/signup"
          className="shrink-0 rounded-full px-4 py-2 font-headline text-xs font-bold shadow-lg transition-all hover:scale-[1.03] active:scale-95 sm:px-6 sm:py-2.5 sm:text-sm"
          style={{ backgroundColor: L.primary, color: L.onPrimaryC }}
        >
          Get Started
        </Link>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-20 pt-36 md:px-6 md:pb-32 md:pt-48">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-14 md:flex-row md:gap-16">
            <div className="z-10 flex-1 text-center md:text-left">
              <span
                className="mb-5 inline-block rounded-full px-4 py-1.5 font-headline text-xs font-bold tracking-widest uppercase"
                style={{
                  backgroundColor: `${L.tertiary}33`,
                  color: L.onTertiaryC,
                }}
              >
                {HOME_HERO.badge}
              </span>
              <h1 className="mb-6 font-headline text-4xl font-extrabold leading-[1.1] tracking-tight text-[#2c2f30] md:text-6xl lg:text-7xl">
                {HOME_HERO.titleBefore}
                <span style={{ color: L.primary }}>{HOME_HERO.titleAccent}</span>
                {HOME_HERO.titleAfter}
              </h1>
              <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#595c5d] md:mx-0 md:text-xl">
                {HOME_HERO.subtitle}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-headline text-lg font-bold shadow-xl transition-all hover:opacity-95 active:scale-[0.98]"
                  style={{ backgroundColor: L.primary, color: L.onPrimaryC, boxShadow: "0 20px 40px -12px rgba(149,68,0,0.25)" }}
                >
                  {HOME_HERO.ctaPrimary}
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded-full border border-black/5 px-8 py-4 font-headline text-lg font-bold shadow-md transition-all hover:bg-[#eff1f2]"
                  style={{ backgroundColor: L.surfaceLowest, color: "#2c2f30" }}
                >
                  {HOME_HERO.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="relative w-full flex-1">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/10 md:aspect-[4/5]">
                <Image
                  src={LUMINOUS_HERO_IMAGE}
                  alt="Creative collaboration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 45vw"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-tr to-transparent"
                  style={{ backgroundImage: `linear-gradient(to top right, ${L.primary}33, transparent)` }}
                />
              </div>
              <div
                className="absolute -bottom-5 -left-4 max-w-[240px] rounded-2xl border p-5 shadow-2xl shadow-black/5 md:-left-10 md:p-6"
                style={{
                  backgroundColor: L.surfaceLowest,
                  borderColor: `${L.outlineVar}33`,
                }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: L.tertiary }}
                  >
                    <TrendingUp className="h-5 w-5" style={{ color: L.onTertiaryC }} aria-hidden />
                  </div>
                  <span className="font-headline text-sm font-bold">Real-time growth</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6e8ea]">
                  <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: L.primary }} />
                </div>
                <p className="mt-2 text-xs font-medium text-[#595c5d]">
                  {growthStat.value} {growthStat.label}
                </p>
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full blur-[100px]"
            style={{ backgroundColor: `${L.primary}1a` }}
          />
          <div
            className="pointer-events-none absolute bottom-[-5%] left-[-5%] h-64 w-64 rounded-full blur-[80px]"
            style={{ backgroundColor: `${L.tertiary}1a` }}
          />
        </section>

        {/* Supported platforms — data from social-brand */}
        <section className="py-16" style={{ backgroundColor: L.surfaceLow }}>
          <div className="mx-auto max-w-7xl px-5 md:px-6">
            <p className="mb-10 text-center font-headline text-xs font-bold tracking-[0.2em] text-[#595c5d] uppercase">
              Supported Platforms
            </p>
            <div className="grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-8">
              {PLATFORM_GRID.map((p) => (
                <div key={p.label} className="group flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm transition-all",
                      p.tileHover
                    )}
                  >
                    <SocialBrandIcon
                      id={p.id}
                      className={cn("h-7 w-7 text-[#595c5f] transition-colors", p.iconHover)}
                    />
                  </div>
                  <span className="text-center text-xs font-bold text-[#595c5d]">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento — copy mapped from homepage */}
        <section className="px-5 py-24 md:px-6 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 max-w-2xl">
              <h2 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-[#2c2f30] md:text-5xl">
                Boost your social presence in minutes
              </h2>
              <p className="text-lg text-[#595c5d]">
                Buy more <DynamicBoostWord />
                <span className="text-[#595c5d]"> — real followers, fast delivery, 24/7 support.</span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="group rounded-2xl bg-white p-8 shadow-sm transition-shadow duration-500 hover:shadow-xl md:col-span-8 md:p-10">
                <div
                  className="mb-6 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${L.primary}1a` }}
                >
                  <Sparkles className="h-7 w-7" style={{ color: L.primary }} aria-hidden />
                </div>
                <h3 className="mb-3 font-headline text-2xl font-bold text-[#2c2f30]">
                  Featured growth packages
                </h3>
                <p className="mb-8 max-w-md text-lg leading-relaxed text-[#595c5d]">
                  Premium social signals for rapid organic reach. Start with TikTok, YouTube,
                  Facebook, or X — same quality bar everywhere.
                </p>
                <div className="relative h-56 overflow-hidden rounded-xl md:h-64">
                  <Image
                    src={BENTO_ANALYTICS_IMAGE}
                    alt="Analytics"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-[#e6e8ea] p-8 transition-colors hover:bg-[#e0e3e4] md:col-span-4 md:p-10">
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <PenLine className="h-6 w-6 text-[#2c2f30]" aria-hidden />
                  </div>
                  <h3 className="mb-2 font-headline text-xl font-bold text-[#2c2f30]">
                    {FEATURED_PACKAGES[0]!.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#595c5d]">
                    {FEATURED_PACKAGES[0]!.desc}
                  </p>
                </div>
                <div className="mt-8 border-t border-black/10 pt-5">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#2c2f30] transition-colors hover:text-[#f97f24]"
                  >
                    View packages <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>

              <div
                className="rounded-2xl p-8 md:col-span-4 md:p-10"
                style={{ backgroundColor: L.tertiary, color: L.onTertiaryC }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${L.onTertiaryC}14` }}
                >
                  <Users className="h-6 w-6" style={{ color: L.onTertiaryC }} aria-hidden />
                </div>
                <h3 className="mb-2 font-headline text-xl font-bold">{VALUE_PROPS[2]!.title}</h3>
                <p className="text-sm leading-relaxed opacity-90">{VALUE_PROPS[2]!.desc}</p>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl p-8 text-white md:col-span-8 md:p-10"
                style={{ backgroundColor: L.inverse }}
              >
                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <BarChart3 className="h-6 w-6 text-[#f97f24]" aria-hidden />
                    </div>
                    <h3 className="mb-3 font-headline text-2xl font-bold">Marketplace momentum</h3>
                    <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
                      {TRUST_BLOCK.headlineLead}
                      <span className="font-bold text-[#f97f24]">{TRUST_BLOCK.headlineAccent}</span>
                      {TRUST_BLOCK.headlineTrail}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                      <div className="mb-3 flex justify-between text-xs text-neutral-400">
                        <span>Orders &amp; satisfaction</span>
                        <span className="font-headline font-bold text-[#f97f24]">Live</span>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <div className="font-headline text-2xl font-black text-white">
                            {TRUST_BLOCK.statAValue}
                          </div>
                          <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                            {TRUST_BLOCK.statALabel}
                          </div>
                        </div>
                        <div>
                          <div className="font-headline text-2xl font-black text-white">
                            {TRUST_BLOCK.statBValue}
                          </div>
                          <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                            {TRUST_BLOCK.statBLabel}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex h-16 items-end gap-1">
                        {[40, 60, 50, 80, 100].map((h, i) => (
                          <div
                            key={i}
                            className="w-full rounded-t-sm bg-[#f97f24]/40"
                            style={{ height: `${h}%`, opacity: i === 4 ? 1 : 0.5 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Press strip — from desktop home */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5 text-center md:px-6">
            <p className="mb-8 font-headline text-xs font-bold tracking-[0.2em] text-[#595c5d] uppercase">
              As featured in
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 md:gap-14">
              <span className="font-headline text-lg font-black tracking-tighter md:text-xl">
                BUSINESS INSIDER
              </span>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
                <span className="font-headline text-lg font-black md:text-xl">DELIVERED SOCIAL</span>
              </div>
              <span className="font-headline text-lg font-semibold md:text-xl">GreeleyTribune</span>
              <span className="font-headline text-lg font-bold md:text-xl">
                RoughDraft{" "}
                <span className="-mt-1 block text-sm font-normal opacity-70">atlanta</span>
              </span>
            </div>
          </div>
        </section>

        {/* Testimonial — real homepage quote */}
        <section className="bg-white py-24 md:py-32">
          <div className="relative mx-auto max-w-7xl px-5 md:px-6">
            <span
              className="pointer-events-none absolute -top-8 left-0 font-serif text-8xl leading-none select-none md:text-9xl"
              style={{ color: `${L.primary}1a` }}
            >
              &ldquo;
            </span>
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <h2 className="mb-10 font-headline text-2xl font-bold leading-snug text-[#2c2f30] md:text-4xl">
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </h2>
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-[#eff1f2]">
                  <Image
                    src={AVATAR_TESTIMONIAL}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <p className="font-headline text-lg font-bold text-[#2c2f30]">{TESTIMONIAL.name}</p>
                <p className="text-sm tracking-widest text-[#595c5d] uppercase">{TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div
              className="relative overflow-hidden rounded-[2rem] px-8 py-16 text-center md:px-20 md:py-24"
              style={{ backgroundColor: L.primary, color: L.onPrimaryC }}
            >
              <div className="relative z-10">
                <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tighter md:text-5xl">
                  Ready to grow?
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg font-medium opacity-90">
                  {HOME_HERO.subtitle}
                </p>
                <Link
                  href="/services"
                  className="inline-block rounded-full px-10 py-4 font-headline text-lg font-bold text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: L.onPrimaryC }}
                >
                  Explore services
                </Link>
              </div>
              <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-96 w-96 rounded-full bg-black/5 blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-black/5 py-14" style={{ backgroundColor: "#e6e8ea" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-6">
          <div className="text-center md:text-left">
            <div className="font-headline text-lg font-bold text-[#2c2f30]">Curator Market</div>
            <p className="mt-1 text-sm text-[#595c5f]">
              Premium SMM services and elite digital accounts.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#595c5f]">
            <Link href="/services" className="transition-colors hover:text-[#2c2f30]">
              Services
            </Link>
            <a href="#" className="transition-colors hover:text-[#2c2f30]">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-[#2c2f30]">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-[#2c2f30]">
              Contact
            </a>
          </div>
          <p className="text-center text-sm text-[#595c5f] md:text-right">
            © {new Date().getFullYear()} Curator Market
          </p>
        </div>
      </footer>
    </div>
  );
}
