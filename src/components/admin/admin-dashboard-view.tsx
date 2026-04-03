import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Banknote,
  Film,
  MonitorPlay,
  MoreHorizontal,
  Music,
  Podcast,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

const CHART_HEIGHTS = ["h-[40%]", "h-[65%]", "h-[50%]", "h-[85%]", "h-[70%]", "h-[95%]", "h-[60%]"] as const;
const CHART_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const INVENTORY: {
  Icon: LucideIcon;
  iconBg: string;
  title: string;
  subtitle: string;
  value: string;
  valueLabel: string;
  dim: boolean;
  valueClass?: string;
}[] = [
  {
    Icon: MonitorPlay,
    iconBg: "bg-red-100 text-red-600",
    title: "Netflix Premium",
    subtitle: "UHD 4K Accounts",
    value: "120",
    valueLabel: "Stock",
    dim: false,
  },
  {
    Icon: Film,
    iconBg: "bg-blue-100 text-blue-600",
    title: "Prime Video",
    subtitle: "Annual Pass",
    value: "45",
    valueLabel: "Stock",
    dim: false,
  },
  {
    Icon: Music,
    iconBg: "bg-green-100 text-green-600",
    title: "Spotify Family",
    subtitle: "6 Months Plan",
    value: "02",
    valueLabel: "Low",
    dim: true,
    valueClass: "text-error",
  },
  {
    Icon: Podcast,
    iconBg: "bg-purple-100 text-purple-600",
    title: "HBO Max",
    subtitle: "Standard HD",
    value: "88",
    valueLabel: "Stock",
    dim: false,
  },
];

const ORDERS = [
  {
    id: "#ORD-8821",
    customer: "Sarah Jenkins",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDAuz-NUWqbm26cbfunqGGehqQ5A0tF0k483WboXw1SymalKBAk4Qf1RgbIjAjXn30eXYofO8DO_6ds-Dge2_QWR--JbyndWxaglqBKO7CSKPp-v2o6WzPF1e7T5xEdmjzBIAf8VlXoX-roYRGAAOrBAWDVxAry2-lTqyNvtOMDReRMQQCBnvkV4XW695Cd_OS041JCClTE7mojzUO4UFzbzpxNqJhQg3KEssvmFcD5bdz9U_gvrJa5xmgY6ZotRYHx_Bre8Lll-gw",
    service: "2,500 TikTok Followers",
    status: "Processing",
    statusClass: "bg-primary/10 text-primary",
    price: "$24.99",
  },
  {
    id: "#ORD-8820",
    customer: "Marcus T.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ6jdN_4rqTKAZGqEdDingQDjCK9oyO7uza9e2mQldMRO5dviAB_zz6Tc-9KN66bQUzYj5PmnaizCEI57WHMTkveBJwuqmuZiOK4erG7NNy1Igcs90zTZ63n7mRiPzNmjM9yxbZtoVuxxER9Dq5vn_SfkCiuzDkpySgMmT3CCrG2UlwFSPk4IevVkCOi0BA61hwU4A0FFy98nYsAApY7gSxObpk3J8-JDlPvmqpZDukAqh24uJxCupOi0h1fU2WyHVi1_ORcInel4",
    service: "Netflix UHD (12 Months)",
    status: "Completed",
    statusClass: "bg-green-100 text-green-700",
    price: "$119.00",
  },
  {
    id: "#ORD-8819",
    customer: "David Chen",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBeyR8aX-VoIca9CcLYyUDzz37laWCsMx-lz3k-Bvrfwvzas_KdDlFeIqHP0aBkeQazuNbhrbet2Te_8WWQK6FUyJHM8MfW4m6QwrxZwD7Tsbr5bO9IuqLhTILjtu42Q9VAJCTayBUVqfKurAE981Sq0ty9dq2prwif3GApMbPPV8lSQkb73VUr6_jp5-OeF1MouWQiJLx5MVLziecbc1ddQNradZrO64jFD6Xa7V-au8enAtfYfw8DM_mlDkIbAwtDlzrYmroXUpo",
    service: "10k Instagram Likes",
    status: "Pending",
    statusClass: "bg-surface-container-highest text-on-surface-variant",
    price: "$45.50",
  },
] as const;

const METRICS: {
  Icon: LucideIcon;
  iconWrap: string;
  badge: string;
  label: string;
  value: string;
}[] = [
  {
    Icon: Banknote,
    iconWrap: "bg-primary/10 text-primary",
    badge: "+12.5%",
    label: "Total Revenue",
    value: "$24,850.00",
  },
  {
    Icon: ShoppingCart,
    iconWrap: "bg-secondary-container/10 text-secondary",
    badge: "+5%",
    label: "Active Orders",
    value: "156",
  },
  {
    Icon: UserPlus,
    iconWrap: "bg-tertiary-container/10 text-tertiary",
    badge: "+18%",
    label: "New Users",
    value: "42",
  },
  {
    Icon: BadgeCheck,
    iconWrap: "bg-surface-variant text-on-surface",
    badge: "+0.2%",
    label: "Completion Rate",
    value: "98.2%",
  },
];

const metricIconClass = "size-6 stroke-[1.75]";
const invIconClass = "size-4 stroke-[1.75]";

export function AdminDashboardView() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div>
        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Welcome back, Admin
        </h2>
        <p className="mt-2 text-lg text-on-surface-variant">
          Here is what&apos;s happening with Curator Market today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="ambient-shadow rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${m.iconWrap}`}
              >
                <m.Icon className={metricIconClass} aria-hidden />
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                {m.badge}
              </span>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">{m.label}</p>
            <h3 className="mt-1 text-2xl font-bold text-on-surface">{m.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="ambient-shadow rounded-xl bg-surface-container-lowest p-8 lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Sales Overview</h3>
            <select className="rounded-full border-none bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="relative flex h-64 items-end gap-2">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-full border-t border-outline-variant/10" />
              ))}
            </div>
            {CHART_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`group relative flex-1 rounded-t-lg transition-colors ${
                  i === 5 ? "bg-primary" : "bg-primary/10 hover:bg-primary/30"
                } ${h}`}
              >
                {i === 0 && (
                  <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-on-surface px-2 py-1 text-[10px] text-surface group-hover:block">
                    $2.1k
                  </div>
                )}
                {i === 5 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-on-surface px-2 py-1 text-[10px] text-surface">
                    $4.8k
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
            {CHART_DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>

        <div className="ambient-shadow rounded-xl bg-surface-container-lowest p-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Inventory</h3>
            <button
              type="button"
              className="text-xs font-bold text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-6">
            {INVENTORY.map((row) => (
              <div
                key={row.title}
                className={`flex items-center justify-between ${row.dim ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${row.iconBg}`}
                  >
                    <row.Icon className={invIconClass} aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{row.title}</p>
                    <p className="text-xs text-on-surface-variant">{row.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${row.valueClass ?? "text-primary"}`}>{row.value}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">{row.valueLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ambient-shadow overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-outline-variant/10 p-8">
          <h3 className="font-headline text-xl font-bold text-on-surface">Recent Orders</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold transition-colors hover:bg-surface-container"
            >
              Download CSV
            </button>
            <button
              type="button"
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary transition-all hover:scale-[1.02] active:scale-100"
            >
              New Order
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Service</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-surface transition-colors">
                  <td className="px-8 py-5 font-mono text-sm font-bold text-primary">{o.id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-container">
                        <Image src={o.avatar} alt="" fill className="object-cover" sizes="32px" />
                      </div>
                      <span className="text-sm font-bold text-on-surface">{o.customer}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface">{o.service}</td>
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${o.statusClass}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-on-surface">{o.price}</td>
                  <td className="px-8 py-5 text-right">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="size-5 stroke-[1.75]" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
