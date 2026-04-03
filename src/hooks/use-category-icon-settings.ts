"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PremiumCategory, SMMCategory } from "@/lib/services-data";
import {
  CATEGORY_ICONS_CHANGED_EVENT,
  type CategoryIconName,
  DEFAULT_PREMIUM_CATEGORY_ICONS,
  DEFAULT_SMM_CATEGORY_ICONS,
  isCategoryIconName,
  loadStoredCategoryIcons,
  saveStoredCategoryIcons,
  type StoredCategoryIcons,
} from "@/lib/category-icons";

function mergeSmm(
  stored: Partial<Record<SMMCategory, CategoryIconName>> | undefined
): Record<SMMCategory, CategoryIconName> {
  const out = { ...DEFAULT_SMM_CATEGORY_ICONS };
  if (!stored) return out;
  for (const k of Object.keys(stored) as SMMCategory[]) {
    const v = stored[k];
    if (v && isCategoryIconName(v)) out[k] = v;
  }
  return out;
}

function mergePremium(
  stored: Partial<Record<PremiumCategory, CategoryIconName>> | undefined
): Record<PremiumCategory, CategoryIconName> {
  const out = { ...DEFAULT_PREMIUM_CATEGORY_ICONS };
  if (!stored) return out;
  for (const k of Object.keys(stored) as PremiumCategory[]) {
    const v = stored[k];
    if (v && isCategoryIconName(v)) out[k] = v;
  }
  return out;
}

function toStored(
  smm: Record<SMMCategory, CategoryIconName>,
  premium: Record<PremiumCategory, CategoryIconName>
): StoredCategoryIcons {
  const smmPart: Partial<Record<SMMCategory, CategoryIconName>> = {};
  for (const k of Object.keys(smm) as SMMCategory[]) {
    if (smm[k] !== DEFAULT_SMM_CATEGORY_ICONS[k]) smmPart[k] = smm[k];
  }
  const premPart: Partial<Record<PremiumCategory, CategoryIconName>> = {};
  for (const k of Object.keys(premium) as PremiumCategory[]) {
    if (premium[k] !== DEFAULT_PREMIUM_CATEGORY_ICONS[k]) premPart[k] = premium[k];
  }
  return { smm: smmPart, premium: premPart };
}

export function useCategoryIconSettings() {
  const [smmIcons, setSmmIcons] = useState<Record<SMMCategory, CategoryIconName>>(() => ({
    ...DEFAULT_SMM_CATEGORY_ICONS,
  }));
  const [premiumIcons, setPremiumIcons] = useState<Record<PremiumCategory, CategoryIconName>>(() => ({
    ...DEFAULT_PREMIUM_CATEGORY_ICONS,
  }));
  const [hydrated, setHydrated] = useState(false);

  const smmRef = useRef(smmIcons);
  const premiumRef = useRef(premiumIcons);
  smmRef.current = smmIcons;
  premiumRef.current = premiumIcons;

  const applyStored = useCallback(() => {
    const raw = loadStoredCategoryIcons();
    const smm = mergeSmm(raw?.smm);
    const prem = mergePremium(raw?.premium);
    setSmmIcons(smm);
    setPremiumIcons(prem);
  }, []);

  useEffect(() => {
    applyStored();
    setHydrated(true);
  }, [applyStored]);

  useEffect(() => {
    const onSync = () => applyStored();
    window.addEventListener(CATEGORY_ICONS_CHANGED_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(CATEGORY_ICONS_CHANGED_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, [applyStored]);

  const setSmmCategoryIcon = useCallback((id: SMMCategory, icon: CategoryIconName) => {
    setSmmIcons((prev) => {
      const next = { ...prev, [id]: icon };
      saveStoredCategoryIcons(toStored(next, premiumRef.current));
      return next;
    });
  }, []);

  const setPremiumCategoryIcon = useCallback((id: PremiumCategory, icon: CategoryIconName) => {
    setPremiumIcons((prev) => {
      const next = { ...prev, [id]: icon };
      saveStoredCategoryIcons(toStored(smmRef.current, next));
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const smm = { ...DEFAULT_SMM_CATEGORY_ICONS };
    const prem = { ...DEFAULT_PREMIUM_CATEGORY_ICONS };
    setSmmIcons(smm);
    setPremiumIcons(prem);
    saveStoredCategoryIcons({ smm: {}, premium: {} });
  }, []);

  return {
    smmIcons,
    premiumIcons,
    setSmmCategoryIcon,
    setPremiumCategoryIcon,
    resetToDefaults,
    hydrated,
  };
}
