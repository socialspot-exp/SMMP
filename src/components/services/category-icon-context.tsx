"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCategoryIconSettings } from "@/hooks/use-category-icon-settings";

type CategoryIconContextValue = ReturnType<typeof useCategoryIconSettings>;

const CategoryIconContext = createContext<CategoryIconContextValue | null>(null);

export function CategoryIconProvider({ children }: { children: ReactNode }) {
  const value = useCategoryIconSettings();
  return <CategoryIconContext.Provider value={value}>{children}</CategoryIconContext.Provider>;
}

export function useServiceCategoryIcons() {
  const ctx = useContext(CategoryIconContext);
  if (!ctx) {
    throw new Error("useServiceCategoryIcons must be used within CategoryIconProvider");
  }
  return ctx;
}
