"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Code2,
  CreditCard,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDe58w8IjQBROtqq7L22MmJZbyjM3q95texb8jRk-UEyXgJkODgekYi4-CPMkMpgxnA1Tgc3b0qxdavbRv0DdQaQi2UnajWFm99eXrvM5qRlhvmErxHuWH0jeEfDAntkyAuYGMW7A52FJGm9zdplZb2sG48Ub-vgKJv7VCEUJkqMSATLuJHeLD4DdBZLZNW60mianRNPgJ39-YcU9pZ60kIpPC4ijP4lHb3kRXMNhVRMqQwMiraHEnRirvwWdWrJ32pEUYCTHus4Bo";

const navIcon = "size-5 shrink-0 stroke-[1.75]";

export function AdminSidebar() {
  const pathname = usePathname();
  const dashActive = pathname === "/admin";
  const usersActive = pathname === "/admin/users";
  const txnsActive = pathname === "/admin/transactions";
  const paymentsActive = pathname === "/admin/payments";
  const apiActive = pathname === "/admin/api";
  const ordersSmmActive = pathname === "/admin/orders/smm";
  const ordersPremiumActive = pathname === "/admin/orders/premium";
  const ordersSectionOpen = pathname.startsWith("/admin/orders");
  const [ordersDetailsOpen, setOrdersDetailsOpen] = useState(ordersSectionOpen);

  const productsSmmActive = pathname === "/admin/products/smm";
  const productsPremiumActive = pathname === "/admin/products/premium";
  const categoriesSmmActive = pathname === "/admin/categories/smm";
  const categoriesPremiumActive = pathname === "/admin/categories/premium";
  const settingsActive = pathname === "/admin/settings";
  const catalogSectionOpen =
    pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories");
  const [catalogDetailsOpen, setCatalogDetailsOpen] = useState(catalogSectionOpen);

  useEffect(() => {
    if (ordersSectionOpen) setOrdersDetailsOpen(true);
  }, [ordersSectionOpen]);

  useEffect(() => {
    if (catalogSectionOpen) setCatalogDetailsOpen(true);
  }, [catalogSectionOpen]);

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-outline-variant/15 bg-surface lg:flex">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Sparkles className="size-6 stroke-[1.75]" aria-hidden />
          </div>
          <div>
            <h1 className="font-headline text-lg leading-tight font-bold text-on-surface">
              Curator Market
            </h1>
            <p className="text-xs font-medium text-on-surface-variant">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4">
        <Link
          href="/admin"
          className={cn(
            "ambient-shadow flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            dashActive
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <LayoutDashboard className={navIcon} aria-hidden />
          Dashboard
        </Link>

        <Link
          href="/admin/transactions"
          className={cn(
            "ambient-shadow flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            txnsActive ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Wallet className={navIcon} aria-hidden />
          Transactions
        </Link>

        <details
          className="group"
          open={ordersDetailsOpen}
          onToggle={(e) => setOrdersDetailsOpen(e.currentTarget.open)}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-surface-container",
              ordersSectionOpen
                ? "text-primary"
                : "text-on-surface-variant"
            )}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className={navIcon} aria-hidden />
              <span className="text-sm font-medium">Orders</span>
            </div>
            <ChevronDown className="expand-icon size-4 shrink-0 stroke-[1.75] transition-transform duration-200" aria-hidden />
          </summary>
          <div className="mt-1 ml-9 space-y-1">
            <Link
              href="/admin/orders/smm"
              className={cn(
                "block w-full rounded-xl px-4 py-2 text-left text-xs font-medium transition-colors",
                ordersSmmActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              )}
            >
              SMM Orders
            </Link>
            <Link
              href="/admin/orders/premium"
              className={cn(
                "block w-full rounded-xl px-4 py-2 text-left text-xs font-medium transition-colors",
                ordersPremiumActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              )}
            >
              Premium Orders
            </Link>
          </div>
        </details>

        <details
          className="group"
          open={catalogDetailsOpen}
          onToggle={(e) => setCatalogDetailsOpen(e.currentTarget.open)}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-surface-container",
              catalogSectionOpen
                ? "text-primary"
                : "text-on-surface-variant"
            )}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className={navIcon} aria-hidden />
              <span className="text-sm font-medium">Catalog</span>
            </div>
            <ChevronDown className="expand-icon size-4 shrink-0 stroke-[1.75] transition-transform duration-200" aria-hidden />
          </summary>
          <div className="mt-1 ml-9 space-y-1">
            <Link
              href="/admin/products/smm"
              className={cn(
                "block w-full rounded-xl px-4 py-2 text-left text-xs font-medium transition-colors",
                productsSmmActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              )}
            >
              SMM Products
            </Link>
            <Link
              href="/admin/products/premium"
              className={cn(
                "block w-full rounded-xl px-4 py-2 text-left text-xs font-medium transition-colors",
                productsPremiumActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              )}
            >
              Premium Products
            </Link>
            <Link
              href="/admin/categories/smm"
              className={cn(
                "block w-full rounded-xl px-4 py-2 text-left text-xs font-medium transition-colors",
                categoriesSmmActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              )}
            >
              SMM Categories
            </Link>
            <Link
              href="/admin/categories/premium"
              className={cn(
                "block w-full rounded-xl px-4 py-2 text-left text-xs font-medium transition-colors",
                categoriesPremiumActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              )}
            >
              Premium Categories
            </Link>
          </div>
        </details>

        <Link
          href="/admin/users"
          className={cn(
            "ambient-shadow flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            usersActive
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Users className={navIcon} aria-hidden />
          Users
        </Link>

        <Link
          href="/admin/api"
          className={cn(
            "ambient-shadow flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            apiActive
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Code2 className={navIcon} aria-hidden />
          Panel API
        </Link>

        <Link
          href="/admin/payments"
          className={cn(
            "ambient-shadow flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            paymentsActive
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <CreditCard className={navIcon} aria-hidden />
          Payments
        </Link>

        <Link
          href="/admin/settings"
          className={cn(
            "ambient-shadow flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            settingsActive
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <Settings className={navIcon} aria-hidden />
          Settings
        </Link>
        {(
          [
            { Icon: Package, label: "Inventory" },
            { Icon: BarChart3, label: "Reports" },
          ] as const
        ).map(({ Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Icon className={navIcon} aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-6">
        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container/20">
            <Image src={AVATAR} alt="" fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-sm font-bold">Alex Curator</p>
            <p className="text-xs text-on-surface-variant">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
