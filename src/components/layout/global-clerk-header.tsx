"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { CuratorUserButton } from "@/components/layout/curator-user-button";
import { usePathname } from "next/navigation";

/** Hidden on `/admin*` — admin chrome uses its own `<UserButton />`. */
export function GlobalClerkHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  // Cart already has its own header chrome (via `ServicesChrome`).
  // Avoid double profile buttons on top-right.
  if (pathname === "/cart") {
    return null;
  }
  /** Home uses `HomeFloatingHeader` for Clerk + CTAs. */
  if (pathname === "/") {
    return null;
  }
  /** Services routes use `ServicesChrome` headers with auth; this bar only added double top offset. */
  if (pathname.startsWith("/services")) {
    return null;
  }

  return (
    <header className="flex items-center justify-end gap-2 border-b border-outline-variant/15 bg-surface-container-lowest/80 px-4 py-2 backdrop-blur-sm">
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <CuratorUserButton />
      </Show>
    </header>
  );
}
