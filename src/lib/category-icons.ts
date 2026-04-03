import {
  type LucideIcon,
  Briefcase,
  Clock,
  Eye,
  Gamepad2,
  Heart,
  MessageCircle,
  Music,
  Radio,
  Share2,
  Shield,
  Sparkles,
  Tv,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type { PremiumCategory, SMMCategory } from "@/lib/services-data";

/** Curated Lucide icons available in admin category picker + storefront. */
export const CATEGORY_ICON_MAP = {
  Users,
  UserPlus,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Radio,
  Clock,
  Tv,
  Music,
  Gamepad2,
  Briefcase,
  Shield,
  Sparkles,
  Zap,
} as const satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof CATEGORY_ICON_MAP;

export const CATEGORY_ICON_OPTIONS: CategoryIconName[] = [
  "Users",
  "UserPlus",
  "Heart",
  "Eye",
  "MessageCircle",
  "Share2",
  "Radio",
  "Clock",
  "Tv",
  "Music",
  "Gamepad2",
  "Briefcase",
  "Shield",
  "Sparkles",
  "Zap",
];

export const DEFAULT_SMM_CATEGORY_ICONS: Record<SMMCategory, CategoryIconName> = {
  followers: "Users",
  likes: "Heart",
  views: "Eye",
  comments: "MessageCircle",
  shares: "Share2",
  subscribers: "UserPlus",
  "watch-time": "Clock",
};

export const DEFAULT_PREMIUM_CATEGORY_ICONS: Record<PremiumCategory, CategoryIconName> = {
  streaming: "Tv",
  music: "Music",
  gaming: "Gamepad2",
  productivity: "Briefcase",
  vpn: "Shield",
};

export const CATEGORY_ICONS_STORAGE_KEY = "curator-admin-category-icons-v1";

export const CATEGORY_ICONS_CHANGED_EVENT = "curator-category-icons-changed";

export type StoredCategoryIcons = {
  smm: Partial<Record<SMMCategory, CategoryIconName>>;
  premium: Partial<Record<PremiumCategory, CategoryIconName>>;
};

export function loadStoredCategoryIcons(): StoredCategoryIcons | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CATEGORY_ICONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as StoredCategoryIcons;
  } catch {
    return null;
  }
}

export function saveStoredCategoryIcons(data: StoredCategoryIcons) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CATEGORY_ICONS_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(CATEGORY_ICONS_CHANGED_EVENT));
  } catch {
    /* ignore quota */
  }
}

export function isCategoryIconName(s: string): s is CategoryIconName {
  return s in CATEGORY_ICON_MAP;
}
