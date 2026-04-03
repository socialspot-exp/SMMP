"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { CuratorUserButton } from "@/components/layout/curator-user-button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

const navLink =
  "cursor-pointer font-headline text-sm font-semibold tracking-tight transition-all active:scale-95";

function DesktopUserMenu() {
  const { user, isLoaded } = useUser();
  const label =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Signed in";

  return (
    <div className="flex items-center gap-3">
      {isLoaded ? (
        <span
          className="hidden max-w-[160px] truncate text-sm font-semibold text-[#2c2f32] sm:inline"
          title={user?.primaryEmailAddress?.emailAddress ?? undefined}
        >
          {label}
        </span>
      ) : (
        <span className="hidden h-4 w-24 animate-pulse rounded bg-slate-200/80 sm:block" aria-hidden />
      )}
      <CuratorUserButton
        appearance={{
          elements: {
            avatarBox:
              "h-9 w-9 ring-2 ring-primary/15 ring-offset-2 ring-offset-[#f5f6fa]",
          },
        }}
      />
    </div>
  );
}

export function DesktopSiteHeader() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { itemCount } = useCart();
  const isHome = pathname === "/";
  const isServices = pathname === "/services";
  const isLogin = pathname === "/login";
  const isSignup = pathname === "/signup";
  const isCart = pathname === "/cart";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#abadb1]/15 bg-[#f5f6fa]/80 shadow-[0_40px_40px_-10px_rgba(44,47,50,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter text-[#2c2f32]"
          >
            Curator Market
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className={cn(
                navLink,
                isHome
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-[#595c5f] hover:text-[#2c2f32]"
              )}
            >
              Marketplace
            </Link>
            <Link
              href="/services"
              className={cn(
                navLink,
                isServices
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-[#595c5f] hover:text-[#2c2f32]"
              )}
            >
              Services
            </Link>
            <span className="cursor-default font-headline text-sm font-semibold tracking-tight text-[#595c5f]/60">
              Growth
            </span>
            <span className="cursor-default font-headline text-sm font-semibold tracking-tight text-[#595c5f]/60">
              Reviews
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              isCart ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
            aria-label={itemCount ? "Cart, 1 item" : "Cart"}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2} aria-hidden />
            {itemCount > 0 ? (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            ) : null}
          </Link>
          {!authLoaded ? (
            <span
              className="h-10 w-36 animate-pulse rounded-lg bg-slate-200/70"
              aria-hidden
            />
          ) : isSignedIn ? (
            <DesktopUserMenu />
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "px-4 py-2 text-sm font-semibold transition-colors",
                  isLogin
                    ? "text-primary"
                    : "text-[#595c5f] hover:text-[#2c2f32]"
                )}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "rounded-lg px-6 py-2.5 text-sm font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95",
                  isSignup
                    ? "bg-primary text-on-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                    : "bg-primary text-on-primary"
                )}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
