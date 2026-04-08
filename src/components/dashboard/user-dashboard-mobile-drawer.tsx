"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Receipt,
  RefreshCw,
  Settings,
  ShoppingBag,
  Store,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface UserDashboardMobileDrawerProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  balance: number | null;
  balanceLoading: boolean;
}

export function UserDashboardMobileDrawer({
  open,
  onClose,
  displayName,
  balance,
  balanceLoading,
}: UserDashboardMobileDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[90] flex w-[min(85vw,20rem)] flex-col bg-surface-container-lowest shadow-2xl transition-transform duration-300 ease-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-4">
          <h2 className="font-headline text-lg font-bold text-on-surface">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container active:scale-95"
            aria-label="Close menu"
          >
            <X className="size-5 stroke-[2]" />
          </button>
        </div>

        {/* Profile */}
        <div className="border-b border-outline-variant/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
              <Image src={PROFILE_IMG} alt="" fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-on-surface">{displayName}</p>
              <p className="text-[10px] tracking-wider text-on-surface-variant uppercase">
                Verified Member
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
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

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
                    active
                      ? "bg-primary/10 font-bold text-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <Icon className="size-5 shrink-0 stroke-[1.75]" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Wallet Balance */}
        <div className="border-t border-outline-variant/10 p-5">
          <div className="rounded-xl bg-surface-container-low p-4">
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
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-lg bg-primary py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-dim active:scale-95"
            >
              Add Funds
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
