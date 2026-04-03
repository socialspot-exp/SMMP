"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettingsRow } from "@/lib/site-settings";
import { mergeSiteSettings } from "@/lib/site-settings";

const SiteSettingsContext = createContext<SiteSettingsRow | null>(null);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettingsRow | null;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={value ? mergeSiteSettings(value) : mergeSiteSettings(null)}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsRow {
  const ctx = useContext(SiteSettingsContext);
  return ctx ?? mergeSiteSettings(null);
}
