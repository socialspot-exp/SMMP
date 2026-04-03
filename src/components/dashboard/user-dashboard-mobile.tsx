"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Headphones,
  Heart,
  Home,
  LineChart,
  Megaphone,
  ShoppingCart,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";

const MOBILE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDAwos6gSW3rgqMbTupu6iQWljQj87oDuAjzb5mco25I2_YO52KU26qc4bzsvuR5aMO2qdSTjuoHG82jz0xo4Z9GgnYaRujQ-IjuL3lRkgsxovQwgJVkMUb64i8_rmeQq6_g3cl7sbtTURr2uz0tu3yzL8vooUVktNL3ej8G9JNjxoj2vLxVmSUd-Boc74Ulnq0QY8SAJpnG6eDPRwX-B5FlWwgB4Hp4gYm8-R17KZ_mdITUAcVgl9mn-ZahGTYebv7LYiyQ5ttSoc";

const DISNEY_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCGD-OQ33DoRk-Hx3_u9NUoDozArPo0M-MXlFLgyaDjUJHvn0jggmDB1raiMlwPd0_xbMPgkp3GMuL3Vjw75CZxjY2Cg_JCDxqx5oNLkuY31A5kgxFhQUNLRexWXihEelRxnEYThCuNk-saPnwyGNcg7gHVY4ZoQdmauTDwSRMT0z4dHjvZZTlhlg-ossGDrMPJerIrIy2BV87tS0qnTiCXF_kDPCmS0qw5sEney2Tu90PI9abtyJps1cc2nG23AK81HV53BR78d1E";

const CARD_SHADOW = "shadow-[0_40px_40px_-10px_rgba(44,47,50,0.04)]";
const CARD_SHADOW_STRONG = "shadow-[0_40px_40px_-10px_rgba(44,47,50,0.06)]";

export function UserDashboardMobile() {
  const { user } = useAuth();
  const firstName = user?.name?.split(/\s+/)[0] ?? "Alex";

  return (
    <div className="min-h-[max(884px,100dvh)] bg-surface pb-32 text-on-surface md:hidden">
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 shadow-[0_4px_40px_-10px_rgba(44,47,50,0.06)] backdrop-blur-xl">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-primary/10 bg-surface-container">
              <Image src={MOBILE_AVATAR} alt="" fill className="object-cover" sizes="40px" />
            </div>
            <h1 className="font-headline text-lg font-bold tracking-tight text-on-surface">
              Marketplace
            </h1>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-all active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="size-5 stroke-[1.75]" />
          </button>
        </div>
        <div className="h-px w-full bg-surface-container-high/80" />
      </header>

      <main className="space-y-8 px-6 pt-6">
        <section className="space-y-1">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Welcome back, {firstName}!
          </h2>
          <p className="font-medium text-on-surface-variant">Your accounts are performing great today.</p>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {(
            [
              {
                Icon: ShoppingCart,
                iconClass: "text-primary",
                label: "Total Orders",
                value: "128",
              },
              {
                Icon: LineChart,
                iconClass: "text-secondary",
                label: "Active Subs",
                value: "4",
              },
              {
                Icon: Wallet,
                iconClass: "text-emerald-600",
                label: "Wallet",
                value: "$240.50",
              },
              {
                Icon: Headphones,
                iconClass: "text-primary",
                label: "Support",
                value: "Active",
              },
            ] as const
          ).map(({ Icon, iconClass, label, value }) => (
            <div
              key={label}
              className={cn(
                "rounded-3xl border border-outline-variant/5 bg-surface-container-lowest p-5",
                CARD_SHADOW
              )}
            >
              <Icon className={cn("mb-3 size-6 stroke-[1.75]", iconClass)} aria-hidden />
              <p className="mb-1 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                {label}
              </p>
              <p className="font-headline text-xl font-bold text-on-surface">{value}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Active SMM Orders</h3>
            <Link href="/dashboard/orders#smm" className="text-sm font-bold text-primary">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            <div
              className={cn("rounded-3xl bg-surface-container-lowest p-6", CARD_SHADOW_STRONG)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Megaphone className="size-5 stroke-[1.75]" aria-hidden />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">TikTok Followers</h4>
                    <p className="text-xs text-on-surface-variant">Order #98221</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-tighter text-primary uppercase">
                  In Progress
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface-variant">750 / 1000</span>
                  <span className="text-primary">75%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full w-[75%] rounded-full bg-primary" />
                </div>
              </div>
            </div>

            <div
              className={cn("rounded-3xl bg-surface-container-lowest p-6", CARD_SHADOW_STRONG)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-orange-500 to-purple-600 text-white">
                    <Heart className="size-5 fill-white stroke-white stroke-[1.5]" aria-hidden />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Instagram Likes</h4>
                    <p className="text-xs text-on-surface-variant">Order #98104</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold tracking-tighter text-amber-700 uppercase">
                  Processing
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface-variant">Waiting for queue</span>
                  <span className="text-on-surface-variant">5%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full w-[5%] rounded-full bg-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h3 className="font-headline text-xl font-bold text-on-surface">Premium Subscriptions</h3>
            <Link
              href="/dashboard/subscriptions"
              className="shrink-0 text-sm font-bold text-primary"
            >
              View all
            </Link>
          </div>
          <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-4 hide-scrollbar">
            <div className="relative min-w-[280px] shrink-0 overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-600/20 blur-3xl" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 flex items-start justify-between">
                  <span className="font-headline text-2xl font-black tracking-tight text-red-500">
                    N
                  </span>
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase">
                    UHD Premium
                  </span>
                </div>
                <p className="mb-1 text-xs text-slate-400">Renews on</p>
                <p className="mb-6 font-bold">Oct 24, 2024</p>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-slate-900 transition-all active:scale-95"
                >
                  Manage
                </button>
              </div>
            </div>

            <div className="relative min-w-[280px] shrink-0 overflow-hidden rounded-3xl bg-blue-900 p-6 text-white shadow-xl">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 flex items-start justify-between">
                  <div className="relative h-8 w-24">
                    <Image
                      src={DISNEY_LOGO}
                      alt="Disney+"
                      fill
                      className="object-contain object-left"
                      sizes="96px"
                    />
                  </div>
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase">
                    Annual
                  </span>
                </div>
                <p className="mb-1 text-xs text-blue-200">Renews on</p>
                <p className="mb-6 font-bold">Jan 12, 2025</p>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-blue-900 transition-all active:scale-95"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h3>
          <div className={cn("rounded-3xl bg-surface-container-lowest p-2", CARD_SHADOW)}>
            <div className="space-y-1">
              {(
                [
                  {
                    Icon: CheckCircle2,
                    wrap: "bg-emerald-50 text-emerald-600",
                    iconFill: true,
                    title: "Order Completed",
                    sub: "500 TikTok Likes",
                    time: "2h ago",
                  },
                  {
                    Icon: Wallet,
                    wrap: "bg-blue-50 text-primary",
                    iconFill: false,
                    title: "Wallet Top-up",
                    sub: "+$50.00 via Crypto",
                    time: "Yesterday",
                  },
                  {
                    Icon: Sparkles,
                    wrap: "bg-purple-50 text-purple-600",
                    iconFill: false,
                    title: "New Subscription",
                    sub: "Netflix Premium UHD",
                    time: "2 days ago",
                  },
                ] as const
              ).map((row) => {
                const ActIcon = row.Icon;
                return (
                <div
                  key={row.title}
                  className="flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-surface-container-low"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      row.wrap
                    )}
                  >
                    <ActIcon
                      className={cn(
                        "size-6 stroke-[1.75]",
                        row.iconFill && "fill-emerald-600 text-emerald-600"
                      )}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-on-surface">{row.title}</p>
                    <p className="text-xs text-on-surface-variant">{row.sub}</p>
                  </div>
                  <p className="shrink-0 text-[10px] font-bold text-on-surface-variant">{row.time}</p>
                </div>
              );
              })}
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-3xl bg-surface-container-lowest/80 px-4 pt-3 pb-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center rounded-2xl bg-primary/10 px-5 py-2 text-primary transition-all duration-200 active:scale-90"
        >
          <Home className="size-6 stroke-[1.75]" />
          <span className="mt-1 font-body text-[10px] font-semibold tracking-wider uppercase">Home</span>
        </Link>
        <Link
          href="/services"
          className="flex flex-col items-center justify-center px-5 py-2 text-on-surface-variant transition-all duration-200 hover:text-primary active:scale-90"
        >
          <Store className="size-6 stroke-[1.75]" />
          <span className="mt-1 font-body text-[10px] font-semibold tracking-wider uppercase">Market</span>
        </Link>
        <a
          href="#"
          className="flex flex-col items-center justify-center px-5 py-2 text-on-surface-variant transition-all duration-200 hover:text-primary active:scale-90"
        >
          <LineChart className="size-6 stroke-[1.75]" />
          <span className="mt-1 font-body text-[10px] font-semibold tracking-wider uppercase">Growth</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center px-5 py-2 text-on-surface-variant transition-all duration-200 hover:text-primary active:scale-90"
        >
          <Wallet className="size-6 stroke-[1.75]" />
          <span className="mt-1 font-body text-[10px] font-semibold tracking-wider uppercase">Wallet</span>
        </a>
      </nav>
    </div>
  );
}
