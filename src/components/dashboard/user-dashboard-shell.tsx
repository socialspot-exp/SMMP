"use client";

import { useClerk } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CircleUser,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Receipt,
  Wallet,
} from "lucide-react";

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
        <p className="mb-3 text-xl font-bold text-on-surface">$45.50</p>
        <button
          type="button"
          className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-dim active:scale-95"
        >
          Add Funds
        </button>
      </div>
    </>
  );
}

function ProfileAccountMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="rounded-full p-2 transition-all duration-200 hover:bg-surface-container active:scale-95 aria-expanded:bg-surface-container"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <CircleUser className="size-6 stroke-[1.75] text-on-surface-variant" />
      </button>
      {open ? (
        <div
          className="ghost-border absolute top-full right-0 z-60 mt-2 min-w-44 rounded-xl bg-surface-container-lowest py-1 shadow-lg ambient-shadow"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
            onClick={() => {
              setOpen(false);
              void signOut({ redirectUrl: "/login" });
            }}
          >
            <LogOut className="size-4 shrink-0 text-on-surface-variant" aria-hidden />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function UserDashboardShell({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const displayName =
    (isLoaded ? user?.username?.trim() : null) ||
    (isLoaded ? user?.fullName?.trim() : null) ||
    (isLoaded ? user?.primaryEmailAddress?.emailAddress?.split("@")[0]?.trim() : null) ||
    "Premium Curator";

  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased">
      <header className="fixed top-0 right-0 left-0 z-50 hidden h-16 w-full items-center justify-between border-b border-outline-variant/15 bg-surface/80 px-4 shadow-[0_40px_40px_-10px_rgba(44,47,50,0.06)] backdrop-blur-xl md:flex md:px-8">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="font-headline text-xl font-bold text-on-surface">
            Curator SMM
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
          <button
            type="button"
            className="rounded-full p-2 transition-all duration-200 hover:bg-surface-container active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="size-6 stroke-[1.75] text-on-surface-variant" />
          </button>
          <ProfileAccountMenu />
        </div>
      </header>

      <aside className="fixed top-0 left-0 hidden h-full w-64 flex-col gap-2 border-r border-outline-variant/15 bg-surface-container-lowest p-4 pt-16 md:flex">
        <SidebarBody displayName={displayName} />
      </aside>

      <main className="min-h-screen max-md:min-h-0 max-md:p-0 max-md:pb-0 md:ml-64 md:px-8 md:pb-8 md:pt-28">
        {children}
      </main>

      <div className="fixed right-4 bottom-4 z-40 hidden md:right-8 md:bottom-8 md:block">
        <Link
          href="/dashboard/services"
          className="group flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-on-primary shadow-2xl transition-all hover:scale-105 active:scale-95 md:gap-3 md:px-6 md:py-4"
        >
          <ShoppingCart className="size-5 shrink-0 stroke-[1.75] md:size-6" />
          <span className="font-headline text-sm font-bold md:text-base">New SMM Order</span>
        </Link>
      </div>
    </div>
  );
}
