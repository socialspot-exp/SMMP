"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CuratorUserButton } from "@/components/layout/curator-user-button";
import { useSiteSettings } from "@/components/site-settings/site-settings-context";
import { cn } from "@/lib/utils";

const ACCENT = "#f97f24";
const ON_ACCENT = "#3d1800";

export function HomeFloatingHeader() {
  const pathname = usePathname();
  const site = useSiteSettings();
  const brandTitle = site.site_title.trim() || "Curator Market";
  const isHome = pathname === "/";
  const isServices = pathname.startsWith("/services");

  const linkMuted =
    "font-headline text-sm font-medium tracking-tight text-[#595c5f] transition-colors hover:text-[#f97f24]";
  const linkActive =
    "border-b-2 border-[#f97f24] pb-1 font-headline text-sm font-bold tracking-tight text-[#f97f24]";

  return (
    <nav
      className={cn(
        // Mobile: normal flow (scrolls away)
        "relative z-50 mx-auto mt-4 flex w-[min(92%,72rem)] items-center justify-between rounded-full border border-black/5 px-5 py-2.5 shadow-2xl shadow-black/5 backdrop-blur-md sm:px-8 sm:py-3",
        // Desktop/tablet: floating header
        "md:fixed md:top-6 md:left-1/2 md:mt-0 md:-translate-x-1/2"
      )}
      style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
    >
      <Link
        href="/"
        className="flex min-w-0 max-w-[min(55%,14rem)] items-center gap-2 sm:max-w-none"
      >
        {site.logo_url?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin may set any HTTPS logo URL
          <img
            src={site.logo_url.trim()}
            alt=""
            className="h-8 w-auto max-w-40 object-contain object-left sm:h-9"
          />
        ) : (
          <span className="font-headline text-xl font-black tracking-tighter text-[#2c2f30] sm:text-2xl">
            {brandTitle}
          </span>
        )}
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        <Link href="/" className={cn(isHome ? linkActive : linkMuted)}>
          Marketplace
        </Link>
        <Link href="/services" className={cn(isServices ? linkActive : linkMuted)}>
          Services
        </Link>
        <span className="cursor-default font-headline text-sm font-medium tracking-tight text-on-surface-variant/60">
          Growth
        </span>
        <span className="cursor-default font-headline text-sm font-medium tracking-tight text-on-surface-variant/60">
          Reviews
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-full px-3 py-2 font-headline text-sm font-semibold text-on-surface-variant transition-colors hover:text-[#f97f24]"
            >
              Login
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Link
              href="/signup"
              className="rounded-full px-4 py-2 font-headline text-xs font-bold shadow-lg transition-all hover:scale-[1.03] active:scale-95 sm:px-6 sm:py-2.5 sm:text-sm"
              style={{ backgroundColor: ACCENT, color: ON_ACCENT }}
            >
              Signup
            </Link>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <CuratorUserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-9 w-9 rounded-full bg-[#f97f24]/10 ring-2 ring-[#f97f24]/35 ring-offset-2 ring-offset-white",
              },
            }}
          />
        </Show>
      </div>
    </nav>
  );
}
