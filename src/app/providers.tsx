"use client";

import type { ReactNode } from "react";
import { ClerkAuthBridge } from "@/components/auth/clerk-auth-bridge";
import { AuthProvider } from "@/components/auth/auth-context";
import { CartProvider } from "@/components/cart/cart-context";
import { SiteSettingsProvider } from "@/components/site-settings/site-settings-context";
import type { SiteSettingsRow } from "@/lib/site-settings";

export function Providers({
  children,
  siteSettings,
}: {
  children: ReactNode;
  siteSettings?: SiteSettingsRow | null;
}) {
  return (
    <SiteSettingsProvider value={siteSettings ?? null}>
      <AuthProvider>
        <ClerkAuthBridge />
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  );
}
