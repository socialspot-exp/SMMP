"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Receipt,
  Wallet,
} from "lucide-react";
import { CuratorUserButton } from "@/components/layout/curator-user-button";
import { HomeFloatingHeader } from "@/components/layout/home-floating-header";

const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBSSgZhipym6woG5eKbmIMu85_RDICfZc_3qHk-DUl7VzXIH6EXRNYGc46Fzis2n0mzJ_d_3dZXL3bIOzyl-TundPfMfoaR8UpbkZhB-IJ6Omq2LWu_6xfXQ-xtK7I4OmjjONA43kDOCTQS7gzuLE1gEmzOp6IFUfx161_gmCvmBzXBoi8cwuQ3cY9B5LlEvOsJYH1D2PrdR7ygu84ofyT_p7iOa5AT_-61D7qo7lBS1HZAy-kQyUjd7onYH5zxn0XSSkfistEcJRQ";

const NAV: { href: string; label: string; Icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/services", label: "Services", Icon: Store },
  { href: "/dashboard/orders", label: "My Orders", Icon: ShoppingBag },
  { href: "/dashboard/subscriptions", label: "Subscriptions", Icon: RefreshCw },
  { href: "/dashboard/wallet", label: "Wallet", Icon: Wallet },
  { href: "/dashboard/wallet/transactions", label: "Transactions", Icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

function SidebarBody({
  onNavigate,
  displayName,
}: {
  onNavigate?: () => void;
  displayName: string;
}) {
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setBalanceLoading(true);
      try {
        const res = await fetch("/api/wallet/summary", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load balance");
        const data = (await res.json()) as { balance: number };
        if (alive) setBalance(Number(data.balance) || 0);
      } catch {
        if (alive) setBalance(0);
      } finally {
        if (alive) setBalanceLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="mb-6 px-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
            <Image src={PROFILE_IMG} alt="" fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-on-surface">{displayName}</p>
            <p className="text-[10px] tracking-wider text-on-surface-variant uppercase">
              Verified Member
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/dashboard/orders"
              ? pathname === href || pathname.startsWith("/dashboard/orders")
              : href === "/dashboard/services"
                ? pathname === href || pathname.startsWith("/dashboard/services")
                : href === "/dashboard/subscriptions"
                  ? pathname === href || pathname.startsWith("/dashboard/subscriptions")
                  : href === "/dashboard/wallet"
                    ? pathname === href || pathname.startsWith("/dashboard/wallet")
                    : href === "/dashboard/wallet/transactions"
                      ? pathname === href || pathname.startsWith("/dashboard/wallet/transactions")
                    : href === "/dashboard/settings"
                      ? pathname === href || pathname.startsWith("/dashboard/settings")
                      : href !== "#" && pathname === href;
          const itemClass = [
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
            active
              ? "scale-[1.02] border-r-4 border-primary bg-primary/10 font-bold text-primary hover:translate-x-1"
              : "text-on-surface-variant hover:translate-x-1 hover:bg-surface hover:text-on-surface",
          ].join(" ");
          const inner = (
            <>
              <Icon className="size-5 shrink-0 stroke-[1.75]" />
              <span>{label}</span>
            </>
          );
          if (
            href === "/dashboard" ||
            href === "/dashboard/orders" ||
            href === "/dashboard/services" ||
            href === "/dashboard/subscriptions" ||
            href === "/dashboard/wallet" ||
            href === "/dashboard/wallet/transactions" ||
            href === "/dashboard/settings"
          ) {
            return (
              <Link key={label} href={href} onClick={onNavigate} className={itemClass}>
                {inner}
              </Link>
            );
          }
          return (
            <a key={label} href={href} onClick={onNavigate} className={itemClass}>
              {inner}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-surface-container-low p-4">
        <p className="mb-2 text-xs text-on-surface-variant">Available Balance</p>
        <p className="mb-3 text-xl font-bold text-on-surface">
          {balanceLoading ? (
            <span className="inline-block h-7 w-20 animate-pulse rounded bg-surface-container" />
          ) : (
            `$${balance?.toFixed(2) ?? "0.00"}`
          )}
        </p>
        <Link
          href="/dashboard/wallet"
          className="flex w-full items-center justify-center rounded-lg bg-primary py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-dim active:scale-95"
        >
          Add Funds
        </Link>
      </div>
    </>
  );
}

export function UserDashboardShell({
  children,
  headerLogoUrl = null,
}: {
  children: ReactNode;
  /** From server layout so header matches SSR (avoids context hydration mismatch). */
  headerLogoUrl?: string | null;
}) {
  const { user, isLoaded } = useUser();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const displayName =
    (isLoaded ? user?.username?.trim() : null) ||
    (isLoaded ? user?.fullName?.trim() : null) ||
    (isLoaded ? user?.primaryEmailAddress?.emailAddress?.split("@")[0]?.trim() : null) ||
    "Premium Curator";

  useEffect(() => {
    if (!notifOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [notifOpen]);

  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased">
      <div className="md:hidden">
        <HomeFloatingHeader />
      </div>
      <header className="fixed top-0 right-0 left-0 z-50 hidden h-16 w-full items-center justify-between border-b border-outline-variant/15 bg-surface/80 px-4 shadow-[0_40px_40px_-10px_rgba(44,47,50,0.06)] backdrop-blur-xl md:flex md:px-8">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center">
            {headerLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin can set external HTTPS logo URL
              <img
                src={headerLogoUrl}
                alt=""
                className="h-8 w-auto max-w-40 object-contain object-left"
              />
            ) : (
              <span className="font-headline text-xl font-bold text-on-surface">Curator SMM</span>
            )}
          </Link>
          <div className="hidden items-center rounded-full border border-outline-variant/15 bg-surface-container-low px-4 py-1.5 md:flex">
            <Search className="mr-2 size-4 shrink-0 text-on-surface-variant" aria-hidden />
            <input
              type="search"
              placeholder="Search services..."
              className="w-64 border-none bg-transparent text-sm placeholder:text-on-surface-variant/60 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="rounded-full p-2 transition-all duration-200 hover:bg-surface-container active:scale-95"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              aria-haspopup="menu"
            >
              <Bell className="size-6 stroke-[1.75] text-on-surface-variant" />
            </button>
            {notifOpen ? (
              <div
                className="ghost-border absolute top-full right-0 z-60 mt-2 w-80 rounded-xl bg-surface-container-lowest p-2 shadow-lg shadow-primary/10 ambient-shadow"
                role="menu"
              >
                <div className="border-b border-primary/10 bg-primary/5 px-3 py-2 rounded-t-lg">
                  <p className="text-sm font-bold text-primary">Notifications</p>
                </div>
                <div className="space-y-1 py-1">
                  <div className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-2 hover:bg-primary/10 transition-colors">
                    <p className="text-xs font-semibold text-on-surface">
                      Order #A1024 is now In Progress
                    </p>
                    <p className="text-[11px] text-primary/70">2 min ago</p>
                  </div>
                  <div className="rounded-lg px-3 py-2 hover:bg-surface-container transition-colors">
                    <p className="text-xs font-semibold text-on-surface">
                      Subscription renewed successfully
                    </p>
                    <p className="text-[11px] text-on-surface-variant">1 hour ago</p>
                  </div>
                  <div className="rounded-lg px-3 py-2 hover:bg-surface-container transition-colors">
                    <p className="text-xs font-semibold text-on-surface">
                      Wallet credited with $20.00
                    </p>
                    <p className="text-[11px] text-on-surface-variant">Yesterday</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <CuratorUserButton
            userProfileMode="modal"
            appearance={{
              elements: {
                avatarBox:
                  "h-9 w-9 ring-2 ring-primary/15 ring-offset-2 ring-offset-surface",
              },
            }}
          />
        </div>
      </header>

      <aside className="fixed top-0 left-0 hidden h-full w-64 flex-col gap-2 border-r border-outline-variant/15 bg-surface-container-lowest p-4 pt-16 md:flex">
        <SidebarBody displayName={displayName} />
      </aside>

      <main className="min-h-screen max-md:min-h-0 max-md:px-0 max-md:pb-0 max-md:pt-2 md:ml-64 md:px-8 md:pb-8 md:pt-20">
        {children}
      </main>
    </div>
  );
}
