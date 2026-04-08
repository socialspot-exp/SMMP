"use client";

import { UserProfile } from "@clerk/nextjs";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export function UserDashboardSettings() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 pb-32 md:space-y-6 md:p-0 md:pb-8">
      <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
        <div className="p-4 md:p-6">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none bg-transparent w-full",
                navbar: "hidden md:flex md:bg-transparent",
                navbarMobileMenuButton: "hidden",
              },
            }}
          />
        </div>
      </div>

      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}

