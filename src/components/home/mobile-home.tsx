import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MoreHorizontal, Play } from "lucide-react";
import { SiNetflix } from "react-icons/si";
import { SocialBrandIcon } from "@/components/home/social-brand";
import { HomeFloatingHeader } from "@/components/layout/home-floating-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileFab } from "@/components/layout/mobile-fab";
import { HeroFlowingSocialIconsNoSSR } from "@/components/home/hero-flowing-social-icons-no-ssr";

const MOBILE_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBZcjFO08dIUGUpPuNBL7a5Jbru-p2aq4wVw0icgwTZug11_Mte0Am9wZ04pv--TfM0dQ6imgwfxq2H9XDn-OF1xyBI3BhV0zIRWl2iQvnrmIhyM_ekVMqIGIpllpP0bODpp5rsMkmD5_gTqVuPt_awBiGO9-MW8NT_SN5b5OueOeREyZOCJgCvoZ-i43FGFyt6biNKjsBHW5TzSsy-EPb1qhlRdxsM_s5hcAfugRFyOMrYQ504S5EDDMRpeCzzofBaCQVBhcxes3A",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAKCjOd-1QiZOy5DVF8xiZRgwNo7sAfzevB5WB8mpiD8yhJyPdvDNm8e8s5SVwUBMO_j9UkAuRduV2LCTFvOfKdE3a1ilELRstiNIzlKn3S40MuZOl-43U9Bmc0WGkmG17jDQqpvSqQph_PR-EufB08ER5TpcvDsljvLI1cqmJywpmDpncn8bQF_qvU3QW-6cQXs1mQwBQKglq1qiyqOWc6WxzXyNsDWx0VccaIwt4Fa9mtzffBqmBabsXszwUYiAJvL9wz7O_0lHU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDsSx984bF2XHR0v3RnaDXbK6ZDxUlZhbpkTVMN6E2jl0DSw8SJErbJoa1vUgPbSx8Tp_p_vghCrsxvXoYaFf26Lfpp2EGqcAo7RumwGa2jbW9IwzNe7FDQv0uO7R_Mh3Vi34npce5GuFWV5Pg5KRJwrQRgPLAkoMPwd4ztMmUVJeXktcz35Gcsh6JoWnU5Cuspf_zQsO0nPPNkWHc7qB2FLX0q3EwI7tEYtQrY8puF_GKrabocPV70AIzIeMNhyaQnEYAJGRHxujs",
];

const MOBILE_PRIMARY_FROM = "#f97f24";
const MOBILE_PRIMARY_TO = "#e87215";

export function MobileHome() {
  return (
    <>
      <HomeFloatingHeader />

      <main className="pb-32 pt-28">
        <section className="mb-12 px-6">
          <div
            className="relative overflow-hidden rounded-[2rem] p-8 text-on-primary"
            style={{
              background: `linear-gradient(to bottom right, ${MOBILE_PRIMARY_FROM}, ${MOBILE_PRIMARY_TO})`,
            }}
          >
            <HeroFlowingSocialIconsNoSSR count={15} sizeClass="h-9 w-9" colorMode="white" />
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10">
              <span className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                Elite Digital Assets
              </span>
              <h2 className="mb-4 font-headline text-4xl leading-[1.1] font-extrabold tracking-tight">
                Boost Your Social Presence &amp; Get Premium Access
              </h2>
              <p className="mb-8 max-w-[240px] text-sm text-on-primary/80">
                High-performance growth services and premium accounts, curated for creators.
              </p>
              <Link
                href="/services"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-lowest px-6 py-4 font-bold transition-all active:scale-[0.98]"
                style={{ color: MOBILE_PRIMARY_FROM }}
              >
                Explore Services
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-12 px-6">
          <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
            <span className="h-6 w-1.5 rounded-full bg-primary" />
            Select Platform
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(
              [
                {
                  label: "Instagram",
                  wrap: "bg-pink-50",
                  icon: <SocialBrandIcon id="instagram" className="h-6 w-6 text-pink-500" />,
                },
                {
                  label: "TikTok",
                  wrap: "bg-blue-50",
                  icon: <SocialBrandIcon id="tiktok" className="h-6 w-6 text-blue-600" />,
                },
                {
                  label: "YouTube",
                  wrap: "bg-red-50",
                  icon: <SocialBrandIcon id="youtube" className="h-6 w-6 text-red-600" />,
                },
                {
                  label: "Facebook",
                  wrap: "bg-sky-50",
                  icon: <SocialBrandIcon id="facebook" className="h-6 w-6 text-sky-600" />,
                },
                {
                  label: "X / Twitter",
                  wrap: "bg-slate-100",
                  icon: <SocialBrandIcon id="x" className="h-6 w-6 text-slate-900" />,
                },
                {
                  label: "More",
                  wrap: "bg-surface-container",
                  icon: (
                    <MoreHorizontal
                      className="h-6 w-6 text-on-surface-variant"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ),
                },
              ] as const
            ).map((p) => (
              <button
                key={p.label}
                type="button"
                className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-transform active:scale-95"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.wrap}`}
                >
                  {p.icon}
                </div>
                <span className="text-center text-[10px] font-bold text-on-surface-variant">
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between px-6">
            <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
              <span className="h-6 w-1.5 rounded-full bg-secondary" />
              Growth Packages
            </h3>
            <span className="text-xs font-bold text-primary">See All</span>
          </div>
          <div className="hide-scrollbar flex gap-6 overflow-x-auto px-6">
            <div className="min-w-[280px] shrink-0 rounded-[1.5rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <SocialBrandIcon id="tiktok" className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">TikTok Viral Mix</h4>
                  <p className="text-[10px] text-on-surface-variant">Views + Likes + Shares</p>
                </div>
              </div>
              <div className="mb-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Delivery Time</span>
                  <span className="font-bold">2-4 Hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Retention</span>
                  <span className="font-bold">High/Lifetime</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-[10px] text-on-surface-variant">Starting at</span>
                  <span className="text-xl font-black text-on-surface">$12.99</span>
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary transition-transform active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="min-w-[280px] shrink-0 rounded-[1.5rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2">
                  <SocialBrandIcon id="youtube" className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">YT Watch Time</h4>
                  <p className="text-[10px] text-on-surface-variant">4000H Monetization Pack</p>
                </div>
              </div>
              <div className="mb-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Delivery Time</span>
                  <span className="font-bold">7-10 Days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Safety</span>
                  <span className="font-bold">100% Organic</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-[10px] text-on-surface-variant">Starting at</span>
                  <span className="text-xl font-black text-on-surface">$49.00</span>
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary transition-transform active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 px-6">
          <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
            <span className="h-6 w-1.5 rounded-full bg-tertiary" />
            Premium Access
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-surface-container-low p-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  <SiNetflix className="h-7 w-7 text-[#E50914]" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold">Netflix Premium 4K</h4>
                  <p className="text-[10px] text-on-surface-variant">
                    Full 30 Days Shared/Private
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="block text-lg font-black text-on-surface">$4.50</span>
                <span className="text-[10px] text-on-surface-variant">per month</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface-container-low p-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A8E1] text-white">
                  <Play className="h-6 w-6 fill-white text-white" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold">Prime Video</h4>
                  <p className="text-[10px] text-on-surface-variant">Ad-Free + HDR Content</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="block text-lg font-black text-on-surface">$2.99</span>
                <span className="text-[10px] text-on-surface-variant">per month</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 px-6">
          <div className="rounded-[2rem] bg-surface-container p-8">
            <h3 className="mb-10 text-center font-headline text-2xl font-extrabold">
              Experience the Pulse
            </h3>
            <div className="space-y-10">
              {[
                {
                  n: "1",
                  t: "Pick Your Asset",
                  d: "Choose from our curated list of social growth services or premium streaming accounts.",
                },
                {
                  n: "2",
                  t: "Secure Checkout",
                  d: "Encrypted payments with instant processing. No hidden fees, ever.",
                },
                {
                  n: "3",
                  t: "Instant Delivery",
                  d: "Watch your stats climb or get your login credentials immediately via email.",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-black text-sm text-on-primary">
                    {step.n}
                  </div>
                  <div className="min-w-0">
                    <h4 className="mb-1 font-bold">{step.t}</h4>
                    <p className="text-xs leading-relaxed text-on-surface-variant">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12 px-6 text-center">
          <div className="border-t border-outline-variant/20 py-10">
            <div className="-space-x-3 mb-4 flex justify-center">
              {MOBILE_AVATARS.map((src, i) => (
                <div
                  key={i}
                  className="h-10 w-10 overflow-hidden rounded-full border-2 border-surface-container-lowest bg-slate-200"
                >
                  <Image
                    src={src}
                    alt=""
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary text-[10px] font-bold text-on-primary">
                +50k
              </div>
            </div>
            <h4 className="mb-2 font-headline text-xl font-bold">Trusted by 50,000+ Creators</h4>
            <p className="text-xs text-on-surface-variant">
              The #1 choice for digital entrepreneurs and social influencers worldwide.
            </p>
          </div>
        </section>
      </main>

      <MobileBottomNav />
      <MobileFab />
    </>
  );
}
