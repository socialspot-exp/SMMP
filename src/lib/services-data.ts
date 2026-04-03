import type { SocialPlatformId } from "@/components/home/social-brand";

export type SMMDuration = "instant" | "24h" | "7d" | "14d";
export type SMMCategory =
  | "followers"
  | "likes"
  | "views"
  | "comments"
  | "shares"
  | "subscribers"
  | "watch-time";

/** Admin-defined storefront tier (qty + price); empty array on product → category defaults. */
export type SmmQuantityOption = {
  qty: number;
  price: number;
  badge?: string | null;
  subtitle?: string | null;
  compareAt?: number | null;
  popular?: boolean;
};

export type SMMService = {
  id: string;
  name: string;
  description: string;
  platform: SocialPlatformId;
  category: SMMCategory;
  priceFrom: number;
  duration: SMMDuration;
  featured: boolean;
  rating: number;
  reviewCount: number;
  topReview?: string;
  /** Public URL slug (DB); static seed rows omit until synced. */
  slug?: string;
  longDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  robots?: string | null;
  /** Saved panel/storefront order bounds when set (from admin / panel API). */
  orderQtyMin?: number | null;
  orderQtyMax?: number | null;
  /** Product-specific FAQs; when empty/omitted, product page uses generic defaults. */
  faqs?: { q: string; a: string }[];
  /** Custom package tiers for the product page; omitted/empty → computed from category. */
  quantityOptions?: SmmQuantityOption[];
  /** Label for the link/username field on the product page; null → default copy. */
  checkoutFieldLabel?: string | null;
  /** Short bullet lines for the product page (e.g. trust/features with checkmarks). */
  features?: string[];
};

export type PremiumCategory = "streaming" | "music" | "gaming" | "productivity" | "vpn";
export type PremiumBilling = "monthly" | "yearly" | "one-time";

/** Brand mark on product pages (Simple Icons / known marks). */
export type PremiumBrandId =
  | "netflix"
  | "prime"
  | "spotify"
  | "discord"
  | "creative"
  | "vpn"
  | "hbomax"
  | "generic";

/** Admin-defined premium plan rows (mirrors SMM quantity_options shape). */
export type PremiumQuantityOption = {
  qty: number;
  price: number;
  badge?: string | null;
  subtitle?: string | null;
  compareAt?: number | null;
  popular?: boolean;
};

export type PremiumService = {
  id: string;
  name: string;
  description: string;
  category: PremiumCategory;
  billing: PremiumBilling;
  brandId: PremiumBrandId;
  priceFrom: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  topReview?: string;
  seats?: string;
  slug?: string;
  longDescription?: string;
  quantityOptions?: PremiumQuantityOption[];
  checkoutFieldLabel?: string | null;
  features?: string[];
  topFeatures?: PremiumTopFeature[];
  faqs?: { q: string; a: string }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  robots?: string | null;
  /** `PremiumCatalogIconKey` string; optional override for UI. */
  iconKey?: string | null;
};

export type PremiumTopFeature = {
  /** `PremiumCatalogIconKey` string (from `premium-catalog-icons.tsx` select). */
  iconKey: string;
  title: string;
  description: string;
};

export const SMM_PLATFORMS: { id: SocialPlatformId; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "x", label: "X" },
  { id: "spotify", label: "Spotify" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "telegram", label: "Telegram" },
];

export const SMM_CATEGORIES: { id: SMMCategory; label: string }[] = [
  { id: "followers", label: "Followers" },
  { id: "likes", label: "Likes" },
  { id: "views", label: "Views" },
  { id: "comments", label: "Comments" },
  { id: "shares", label: "Shares" },
  { id: "subscribers", label: "Subscribers" },
  { id: "watch-time", label: "Watch time" },
];

export const SMM_DURATIONS: { id: SMMDuration; label: string }[] = [
  { id: "instant", label: "Instant" },
  { id: "24h", label: "Within 24h" },
  { id: "7d", label: "Up to 7 days" },
  { id: "14d", label: "Up to 14 days" },
];

export const PREMIUM_CATEGORIES: { id: PremiumCategory; label: string }[] = [
  { id: "streaming", label: "Streaming" },
  { id: "music", label: "Music" },
  { id: "gaming", label: "Gaming" },
  { id: "productivity", label: "Productivity" },
  { id: "vpn", label: "VPN & tools" },
];

export const PREMIUM_BILLING: { id: PremiumBilling; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "one-time", label: "One-time" },
];

export const SMM_SERVICES: SMMService[] = [
  {
    id: "S001",
    name: "TikTok Followers — Viral tier",
    description: "High-retention followers with gradual delivery. Ideal for new accounts.",
    platform: "tiktok",
    category: "followers",
    priceFrom: 2.99,
    duration: "24h",
    featured: true,
    rating: 4.9,
    reviewCount: 1842,
    topReview: "Delivered faster than quoted, zero drops so far.",
  },
  {
    id: "S002",
    name: "Instagram Reels Views + Likes bundle",
    description: "Boost reach with paired views and engagement signals.",
    platform: "instagram",
    category: "views",
    priceFrom: 8.5,
    duration: "instant",
    featured: true,
    rating: 4.8,
    reviewCount: 920,
    topReview: "Saw a clear bump in explore within 48h.",
  },
  {
    id: "S003",
    name: "YouTube Watch Hours pack",
    description: "Organic-style watch time toward monetization thresholds.",
    platform: "youtube",
    category: "watch-time",
    priceFrom: 49,
    duration: "7d",
    featured: true,
    rating: 4.7,
    reviewCount: 612,
  },
  {
    id: "S004",
    name: "X (Twitter) Followers",
    description: "Profile growth with mixed geo, steady drip delivery.",
    platform: "x",
    category: "followers",
    priceFrom: 3.75,
    duration: "24h",
    featured: false,
    rating: 4.6,
    reviewCount: 430,
  },
  {
    id: "S005",
    name: "Facebook Page Likes",
    description: "Page credibility and social proof for brands.",
    platform: "facebook",
    category: "likes",
    priceFrom: 4.2,
    duration: "instant",
    featured: false,
    rating: 4.5,
    reviewCount: 305,
  },
  {
    id: "S006",
    name: "Spotify Monthly Listeners",
    description: "Listener growth for playlist and artist profiles.",
    platform: "spotify",
    category: "followers",
    priceFrom: 6.99,
    duration: "7d",
    featured: false,
    rating: 4.4,
    reviewCount: 198,
  },
  {
    id: "S007",
    name: "LinkedIn Connections",
    description: "B2B-focused connection growth with industry targeting.",
    platform: "linkedin",
    category: "followers",
    priceFrom: 12.99,
    duration: "14d",
    featured: false,
    rating: 4.8,
    reviewCount: 267,
  },
  {
    id: "S008",
    name: "Telegram Channel Members",
    description: "Member adds with optional premium tier accounts.",
    platform: "telegram",
    category: "followers",
    priceFrom: 5.5,
    duration: "24h",
    featured: false,
    rating: 4.5,
    reviewCount: 144,
  },
  {
    id: "S009",
    name: "TikTok Comments (custom)",
    description: "Authentic-style thread engagement for algorithm boost.",
    platform: "tiktok",
    category: "comments",
    priceFrom: 9.99,
    duration: "instant",
    featured: false,
    rating: 4.6,
    reviewCount: 88,
  },
  {
    id: "S010",
    name: "YouTube Subscribers",
    description: "Subscriber growth with refill window on eligible tiers.",
    platform: "youtube",
    category: "subscribers",
    priceFrom: 12.5,
    duration: "7d",
    featured: true,
    rating: 4.9,
    reviewCount: 1103,
    topReview: "Clean dashboard + predictable delivery windows.",
  },
];

export const PREMIUM_SERVICES: PremiumService[] = [
  {
    id: "P001",
    name: "Netflix Premium 4K",
    brandId: "netflix",
    description: "UHD streaming, multiple screens, private or shared slots.",
    category: "streaming",
    billing: "monthly",
    priceFrom: 4.99,
    featured: true,
    rating: 4.9,
    reviewCount: 2401,
    topReview: "Instant credentials, worked on all my devices.",
    seats: "1–4 screens",
  },
  {
    id: "P002",
    name: "Prime Video + Amazon perks",
    brandId: "prime",
    description: "Full Prime Video access with regional catalog unlock.",
    category: "streaming",
    billing: "yearly",
    priceFrom: 19.99,
    featured: true,
    rating: 4.7,
    reviewCount: 887,
    seats: "1 profile",
  },
  {
    id: "P003",
    name: "Spotify Premium Individual",
    brandId: "spotify",
    description: "Ad-free music, offline downloads, yearly or monthly.",
    category: "music",
    billing: "yearly",
    priceFrom: 24.99,
    featured: true,
    rating: 4.8,
    reviewCount: 1520,
  },
  {
    id: "P004",
    name: "Discord Nitro (gift / upgrade)",
    brandId: "discord",
    description: "HD streaming, larger uploads, profile flair.",
    category: "gaming",
    billing: "monthly",
    priceFrom: 3.49,
    featured: false,
    rating: 4.6,
    reviewCount: 412,
  },
  {
    id: "P005",
    name: "Adobe Creative Cloud seat",
    brandId: "creative",
    description: "Shared team slot with renewal warranty options.",
    category: "productivity",
    billing: "monthly",
    priceFrom: 22,
    featured: false,
    rating: 4.5,
    reviewCount: 203,
  },
  {
    id: "P006",
    name: "VPN Premium — multi-region",
    brandId: "vpn",
    description: "High-speed nodes, streaming-optimized servers.",
    category: "vpn",
    billing: "one-time",
    priceFrom: 8.99,
    featured: false,
    rating: 4.4,
    reviewCount: 156,
  },
  {
    id: "P007",
    name: "HBO Max / Max UHD",
    brandId: "hbomax",
    description: "Premium HBO catalog with 4K where available.",
    category: "streaming",
    billing: "monthly",
    priceFrom: 5.49,
    featured: false,
    rating: 4.6,
    reviewCount: 334,
  },
];

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "reviews";

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured first" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Highest rated" },
  { id: "reviews", label: "Most reviewed" },
];

export function getSmmServiceById(id: string): SMMService | undefined {
  return SMM_SERVICES.find((s) => s.id === id);
}

export function getPremiumServiceById(id: string): PremiumService | undefined {
  return PREMIUM_SERVICES.find((s) => s.id === id);
}
