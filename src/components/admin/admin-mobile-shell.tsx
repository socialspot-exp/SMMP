"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Banknote,
  BarChart3,
  Bell,
  CloudCheck,
  Code2,
  CreditCard,
  History,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AdminClerkUserButton } from "@/components/admin/admin-clerk-user-button";
import { useSiteSettings } from "@/components/site-settings/site-settings-context";
import { cn } from "@/lib/utils";

const DRAWER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA7eWCCvuzTR0dSUJT9oHhYXQSnFJDGevYor_Mzdqxhfg44DLjCk6v3BqtTGTUrQpLBXF-99ZGjBfpke5VKSpl_RxvcO3avdmyiQ_PhGich24ap8bzt-3trXlw6lS8dDuDZ3AsZSIq9O7Xajm5f0LVuGN0x-VU4y7Lew4uuRL_SoD0rMJvLtPukP8IpV2npxCJSNqBAYSUi7-sHtp5kF4VL8WXnsjRNNOL8xylDmLQwCfrSVIdSe94F5jTpb3EgyP56m8r4mjtbVOk";

const MOBILE_ORDERS = [
  {
    id: "ORD-99241",
    title: "10k Followers Pack",
    customer: "@alex_curates",
    status: "In Progress",
    statusClass: "bg-primary/10 text-primary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuADVlq5uHbTjdwlV45iEapZ5hUUvKwG_68Nrrf8FY-soL9CLB1k5AEaWiBDyGNLKfuM8tkawTahoo1N_wQ5aVKy2YCxeEdgakc8bmUTGfh3r-DcmfuKwNyo7SzgQ9bfXyiNj83i3ivLXv3FEyS-70zgTW0ltyhzw4tOLcI-ewe0WRGIjiXFd0GpWYdH9IifgdHrSKS10JSYnTe2_GifEyBNv2VSIFkwQUIh-P4CvbyuYFcKRq9swlBDp3VJKW9m4zlZQ-XcH2Ff2RI",
    imageAlt: "Order thumbnail",
  },
  {
    id: "ORD-99238",
    title: "Premium Account Set",
    customer: "Jordan Smith",
    status: "Completed",
    statusClass: "bg-tertiary/10 text-tertiary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBW7q4D4G8KHWBIlhATpLgK1m914YH-BssYtSIVHQYZYihjqwivph2Z-G87VhTZuJmXpIaDidstjM9JIkOeaae9Xq_2gm2FnuB7fr9WazigmC50YSbWkhOaOKza2GUvLdqI--5NxEIRCRNZt9v2RQsrbKd5ydujolzCoTVmkkqhUfdv_bqPxICjSpgeFXjtHFs560B226LuWWgOebQkbl9oSsDf-JH62aOLhxaS-u8v_Y-ruVSD87KpcsZnvC8g9RHusSR-3XCNwMA",
    imageAlt: "Order thumbnail",
  },
  {
    id: "ORD-99235",
    title: "Engagement Booster",
    customer: "The Viral Lab",
    status: "Pending",
    statusClass: "bg-secondary-container text-on-secondary-container",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPj2LBK7C7PeI-E8NKgC0PyxIYUbCxkYymedkkegQP8RTt1XYY7UzOFhcX2bUrtZvKDWlJRy5cN_w3XBT2g7rQPGmTWLiX2ZgVb7b9NDoom5vi3bgTTzY2IMrN66EmGAV4OQAorvHYbKmy0Iz1FQessWZUeGmJhMWExohyDIjwSk609RpJNJyBcgYZJMkUj55e54S3s49DCtGGKFzDmWDuDKCe-FcqznTdtaK52yaZOAN9aa10XApx84wuk-jgSR8Y_7aJhO1NjOw",
    imageAlt: "Order thumbnail",
  },
] as const;

const METRIC_SHADOW = "shadow-[40px_-10px_40px_-10px_rgba(44,47,50,0.06)]";

const CHART_COLS = [
  { outer: "h-[40%]", inner: "bg-primary/20" },
  { outer: "h-[65%]", inner: "bg-primary/40" },
  { outer: "h-[50%]", inner: "bg-primary/30" },
  { outer: "h-[85%]", inner: "bg-primary shadow-lg shadow-primary/20" },
  { outer: "h-[45%]", inner: "bg-primary/40" },
  { outer: "h-[70%]", inner: "bg-primary/60" },
  { outer: "h-[60%]", inner: "bg-primary/50" },
] as const;

const DRAWER_LINKS: { href: string; label: string; Icon: typeof LayoutDashboard }[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders/smm", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/transactions", label: "Transactions", Icon: History },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/api", label: "Panel API", Icon: Code2 },
  { href: "/admin/payments", label: "Payments", Icon: CreditCard },
  { href: "#", label: "Inventory", Icon: Package },
  { href: "#", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminMobileShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const site = useSiteSettings();

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-[max(884px,100dvh)] bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container lg:hidden">
      <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-surface-bright/80 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full p-2 transition-all duration-300 hover:bg-surface-container-highest"
            aria-label="Open menu"
          >
            <Menu className="size-6 stroke-[1.75] text-primary" />
          </button>
          <h1 className="font-headline text-xl font-bold tracking-tight text-on-surface">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 transition-all duration-300 hover:bg-surface-container-highest"
            aria-label="Search"
          >
            <Search className="size-6 stroke-[1.75] text-on-surface-variant" />
          </button>
          <button
            type="button"
            className="relative rounded-full p-2 transition-all duration-300 hover:bg-surface-container-highest"
            aria-label="Notifications"
          >
            <Bell className="size-6 stroke-[1.75] text-on-surface-variant" />
            <span className="border-surface absolute top-2 right-2 h-2 w-2 rounded-full border-2 bg-secondary" />
          </button>
          <AdminClerkUserButton />
        </div>
      </header>

      <main className="pb-24">
        <section className="mt-6">
          <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto px-6">
            <div
              className={cn(
                "flex w-[280px] shrink-0 snap-start flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5",
                METRIC_SHADOW
              )}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Banknote className="size-6 stroke-[1.75] text-primary" />
                </div>
                <span className="rounded-lg bg-primary/5 px-2 py-1 text-xs font-bold text-primary">
                  +12.5%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Total Revenue</p>
                <h3 className="mt-1 font-headline text-2xl font-extrabold">$128,430.00</h3>
              </div>
            </div>

            <div
              className={cn(
                "flex w-[280px] shrink-0 snap-start flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5",
                METRIC_SHADOW
              )}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-secondary/10 p-3">
                  <ShoppingBag className="size-6 stroke-[1.75] text-secondary" />
                </div>
                <span className="rounded-lg bg-secondary/5 px-2 py-1 text-xs font-bold text-secondary">
                  42 New
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Active Orders</p>
                <h3 className="mt-1 font-headline text-2xl font-extrabold">1,240</h3>
              </div>
            </div>

            <div
              className={cn(
                "flex w-[280px] shrink-0 snap-start flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5",
                METRIC_SHADOW
              )}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-tertiary/10 p-3">
                  <Users className="size-6 stroke-[1.75] text-tertiary" />
                </div>
                <span className="rounded-lg bg-tertiary/5 px-2 py-1 text-xs font-bold text-tertiary">
                  +8%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface-variant">New Users</p>
                <h3 className="mt-1 font-headline text-2xl font-extrabold">856</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 px-6">
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-on-surface">Sales Overview</h2>
              <select className="rounded-lg border-none bg-surface-container-low py-1 pr-8 text-xs font-bold text-on-surface-variant focus:ring-2 focus:ring-primary/20 focus:outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="relative flex h-48 w-full items-end justify-between gap-2">
              {CHART_COLS.map((col, i) => (
                <div
                  key={i}
                  className={cn("relative w-full rounded-t-lg bg-primary/10", col.outer)}
                >
                  <div
                    className={cn(
                      "absolute right-0 bottom-0 left-0 h-full rounded-t-lg",
                      col.inner
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">Recent Orders</h2>
            <button type="button" className="text-sm font-bold text-primary">
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {MOBILE_ORDERS.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  <Image src={o.image} alt={o.imageAlt} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="mb-0.5 text-xs font-bold text-on-surface-variant">{o.id}</p>
                      <h4 className="text-sm font-bold text-on-surface">{o.title}</h4>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        o.statusClass
                      )}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Customer:{" "}
                    <span className="font-medium text-on-surface">{o.customer}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div
        role="presentation"
        className={cn(
          "fixed inset-0 z-40 bg-on-surface/20 backdrop-blur-sm transition-opacity",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-72 flex-col bg-surface shadow-[40px_-10px_40px_-10px_rgba(44,47,50,0.06)] transition-transform duration-300",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <div className="flex items-center gap-2">
            {site.logo_url?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin can set external HTTPS logo URL
              <img
                src={site.logo_url.trim()}
                alt=""
                className="h-8 w-auto max-w-40 object-contain object-left"
              />
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
                  <Sparkles className="size-5 stroke-[1.75]" />
                </div>
                <span className="font-headline text-lg font-bold text-on-surface">Curator Market</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-full p-2 hover:bg-surface-container-highest"
            aria-label="Close menu"
          >
            <X className="size-5 stroke-[1.75] text-on-surface-variant" />
          </button>
        </div>

        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-surface-container-highest">
            <Image src={DRAWER_AVATAR} alt="" fill className="object-cover" sizes="48px" />
          </div>
          <div>
            <h4 className="font-headline text-sm font-bold text-on-surface">Alex Curator</h4>
            <p className="text-xs text-on-surface-variant">Super Admin</p>
          </div>
        </div>

        <nav className="flex flex-col px-2">
          {DRAWER_LINKS.map(({ href, label, Icon }, i) => {
            const itemClass = cn(
              "mx-2 my-1 flex items-center gap-3 rounded-xl px-4 py-3 font-headline text-sm font-medium transition-all",
              i === 0
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high/80"
            );
            const inner = (
              <>
                <Icon className="size-5 shrink-0 stroke-[1.75]" />
                {label}
              </>
            );
            if (href.startsWith("/admin")) {
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={itemClass}
                >
                  {inner}
                </Link>
              );
            }
            return (
              <a
                key={label}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={itemClass}
              >
                {inner}
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-6">
          <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            v2.4.0
          </p>
        </div>
      </aside>

      <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-8 rounded-2xl bg-inverse-surface px-8 py-4 shadow-2xl">
        <a href="#" className="flex scale-110 flex-col items-center gap-1 text-inverse-primary">
          <History className="size-6 stroke-[1.75]" />
          <span className="font-body text-[10px] tracking-widest uppercase">History</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center gap-1 text-inverse-on-surface transition-all hover:text-primary"
        >
          <RefreshCw className="size-6 stroke-[1.75]" />
          <span className="font-body text-[10px] tracking-widest uppercase">Sync</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center gap-1 text-inverse-on-surface transition-all hover:text-primary"
        >
          <AlertCircle className="size-6 stroke-[1.75]" />
          <span className="font-body text-[10px] tracking-widest uppercase">Logs</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center gap-1 text-inverse-on-surface transition-all hover:text-primary"
        >
          <CloudCheck className="size-6 stroke-[1.75]" />
          <span className="font-body text-[10px] tracking-widest uppercase">Backup</span>
        </a>
      </nav>

      <button
        type="button"
        className="fixed right-6 bottom-28 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-xl shadow-primary/30 transition-all active:scale-95"
        aria-label="Add"
      >
        <Plus className="size-7 stroke-[1.75]" />
      </button>
    </div>
  );
}
