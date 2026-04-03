"use client";

import {
  BarChart3,
  CheckCircle2,
  History,
  Repeat2,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { UserDashboardMobile } from "@/components/dashboard/user-dashboard-mobile";
import { cn } from "@/lib/utils";

const ACTIVE_ORDERS = [
  {
    service: "2,500 TikTok Followers",
    orderId: "9921",
    link: "tiktok.com/@alex_vibe...",
    current: 1200,
    total: 2500,
    pct: 48,
    status: "In Progress",
    statusClass: "bg-blue-100 text-blue-700",
  },
  {
    service: "5,000 Instagram Likes",
    orderId: "9918",
    link: "instagram.com/p/Cg7H...",
    current: 4900,
    total: 5000,
    pct: 98,
    status: "Processing",
    statusClass: "bg-orange-100 text-orange-700",
  },
] as const;

const SUBSCRIPTIONS = [
  { badge: "N", badgeClass: "bg-red-600", title: "Netflix UHD Premium", renews: "Renews Oct 24" },
  { badge: "D+", badgeClass: "bg-blue-500", title: "Disney+ Annual", renews: "Renews Dec 12" },
] as const;

export function UserDashboardOverview() {
  const { user } = useAuth();
  const firstName = user?.name?.split(/\s+/)[0] ?? "Alex";

  return (
    <>
      <UserDashboardMobile />

      <div className="hidden md:block">
      <div className="pt-2">
      <div className="mb-8">
        <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Welcome back, {firstName}!
        </h1>
        <p className="text-lg text-on-surface-variant">
          You have{" "}
          <span className="font-semibold text-primary">3 active orders</span> today. Your accounts are
          growing.{" "}
          <Link href="/dashboard/services" className="font-semibold text-primary hover:underline">
            Browse SMM &amp; premium services
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-4 md:px-6">
            <h3 className="font-headline text-base font-bold text-on-surface md:text-lg">
              Active SMM Orders
            </h3>
            <Link
              href="/dashboard/orders#smm"
              className="text-xs font-bold text-primary hover:underline"
            >
              View all SMM orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="bg-surface-container-low/30 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                  <th className="px-4 py-3 md:px-6">Service Name</th>
                  <th className="px-4 py-3 md:px-6">Target Link</th>
                  <th className="px-4 py-3 md:px-6">Progress</th>
                  <th className="px-4 py-3 text-right md:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {ACTIVE_ORDERS.map((row) => (
                  <tr key={row.orderId} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-4 md:px-6">
                      <p className="text-sm font-bold text-on-surface">{row.service}</p>
                      <p className="text-[10px] text-on-surface-variant">Order #{row.orderId}</p>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <a
                        href="#"
                        className="block max-w-[250px] truncate text-xs text-primary hover:underline"
                      >
                        {row.link}
                      </a>
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="w-40 md:w-48">
                        <div className="mb-1 flex justify-between text-[10px] text-on-surface">
                          <span>
                            {row.current.toLocaleString()}/{row.total.toLocaleString()}
                          </span>
                          <span>{row.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right md:px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase ${row.statusClass}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(
            [
              { label: "Total Orders", value: "124", Icon: BarChart3 },
              { label: "Active Subs", value: "3", Icon: Repeat2 },
              { label: "Wallet", value: "$45.50", Icon: Wallet },
              { label: "Support", value: "0", Icon: Ticket },
            ] as const
          ).map(({ label, value, Icon }) => (
            <div
              key={label}
              className="group flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm transition-all duration-300 hover:bg-primary md:gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-white/20">
                <Icon className="size-5 stroke-[1.75] text-primary group-hover:text-on-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase group-hover:text-on-primary/70">
                  {label}
                </p>
                <p className="text-lg font-bold text-on-surface group-hover:text-on-primary md:text-xl">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-12 flex flex-col rounded-xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="font-headline text-lg font-bold text-on-surface">Premium Subscriptions</h3>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/dashboard/subscriptions"
                className="text-xs font-bold text-primary hover:underline"
              >
                View subscriptions
              </Link>
              <Sparkles className="size-6 stroke-[1.75] text-primary" aria-hidden />
            </div>
          </div>
          <div className="space-y-4">
            {SUBSCRIPTIONS.map((s) => (
              <div
                key={s.title}
                className="flex items-center justify-between rounded-lg border border-outline-variant/5 bg-surface-container-low p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                      s.badgeClass
                    )}
                  >
                    {s.badge}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface">{s.title}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">{s.renews}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded bg-surface-container px-3 py-1 text-xs font-bold transition-colors hover:bg-surface-container-high"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 flex flex-col rounded-xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-on-surface">Recent Activity</h3>
            <History className="size-5 stroke-[1.75] text-on-surface-variant" aria-hidden />
          </div>
          <div className="relative mb-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:z-0 before:w-0.5 before:bg-surface-container">
            <div className="relative z-10 pl-8">
              <div className="absolute top-1 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="size-3.5 fill-green-600 text-green-600" aria-hidden />
              </div>
              <p className="text-sm font-bold text-on-surface">Order #8821 Completed</p>
              <p className="text-xs text-on-surface-variant">2,000 YouTube Views delivered</p>
              <p className="mt-1 text-[10px] text-on-surface-variant/60 uppercase">2 hours ago</p>
            </div>
            <div className="relative z-10 pl-8">
              <div className="absolute top-1 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="size-3.5 stroke-[1.75] text-primary" aria-hidden />
              </div>
              <p className="text-sm font-bold text-on-surface">Wallet topped up by $20</p>
              <p className="text-xs text-on-surface-variant">Via Stripe Payment</p>
              <p className="mt-1 text-[10px] text-on-surface-variant/60 uppercase">5 hours ago</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-auto w-full border-t border-outline-variant/10 pt-4 text-xs font-bold text-on-surface-variant transition-colors hover:text-primary"
          >
            View Full Audit Log
          </button>
        </div>
      </div>
      </div>
      </div>
    </>
  );
}
