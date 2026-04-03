"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CuratorUserButton } from "@/components/layout/curator-user-button";
import { Bell, LayoutGrid, LogIn } from "lucide-react";

export function MobileSiteHeader() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 shadow-[0_4px_20px_-10px_rgba(44,47,50,0.06)] backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between px-6">
        <button
          type="button"
          className="cursor-pointer transition-opacity hover:opacity-80 active:scale-95"
          aria-label="Menu"
        >
          <LayoutGrid className="h-6 w-6 text-primary" strokeWidth={2} />
        </button>
        <Link
          href="/"
          className="font-headline text-xl font-black tracking-tighter text-slate-900"
        >
          CURATOR
        </Link>
        <div className="flex items-center gap-1">
          {!isLoaded ? (
            <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200/80" aria-hidden />
          ) : isSignedIn ? (
            <CuratorUserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-primary/15 ring-offset-1 ring-offset-white",
                },
              }}
            />
          ) : (
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-primary transition-colors hover:bg-slate-100"
              aria-label="Sign in"
            >
              <LogIn className="h-6 w-6" strokeWidth={2} />
            </Link>
          )}
          <button
            type="button"
            className="cursor-pointer transition-opacity hover:opacity-80 active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6 text-primary" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 h-px w-full bg-slate-100" />
    </header>
  );
}
