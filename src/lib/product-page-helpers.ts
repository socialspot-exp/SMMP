import type { PremiumCategory, SMMCategory } from "@/lib/services-data";
import type { PremiumService, SMMService, SmmQuantityOption } from "@/lib/services-data";
import { PREMIUM_SERVICES, SMM_SERVICES } from "@/lib/services-data";

export type PriceTier = {
  id: string;
  label: string;
  price: number;
  description: string;
};

export type SmmDisplayTier = {
  id: string;
  badge: string;
  qtyLabel: string;
  unitWord: string;
  price: number;
  compareAt: number;
  popular: boolean;
  mobileSubtitle: string;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const QTY_BY_CATEGORY: Record<SMMCategory, [string, string, string, string]> = {
  followers: ["500", "1,000", "5,000", "10,000"],
  subscribers: ["500", "1,000", "5,000", "10,000"],
  likes: ["1,000", "2,500", "10,000", "25,000"],
  views: ["5,000", "10,000", "50,000", "100,000"],
  comments: ["25", "50", "200", "500"],
  shares: ["100", "250", "1,000", "2,500"],
  "watch-time": ["500", "1,000", "2,500", "5,000"],
};

const UNIT_WORD: Record<SMMCategory, string> = {
  followers: "Followers",
  subscribers: "Subscribers",
  likes: "Likes",
  views: "Views",
  comments: "Comments",
  shares: "Shares",
  "watch-time": "Watch hours",
};

const TIER_BADGES = ["Starter", "Popular", "Growth", "Elite"] as const;
const PRICE_MULT = [0.52, 1, 3.85, 6.6] as const;
const COMPARE_MULT = [1.38, 1.58, 1.46, 1.42] as const;
const MOBILE_SUBS = [
  "Instant delivery • No drop",
  "Instant delivery • Lifetime warranty",
  "Drip-feed delivery • High quality",
  "Priority queue • Maximum reach",
] as const;

function tiersFromQuantityOptions(
  service: SMMService,
  opts: SmmQuantityOption[]
): SmmDisplayTier[] {
  const cat = (QTY_BY_CATEGORY as Record<string, [string, string, string, string]>)[service.category]
    ? service.category
    : ("followers" as SMMCategory);
  const unitWord = UNIT_WORD[cat];
  const flagged = opts.findIndex((o) => o.popular === true);
  const popularIndex =
    flagged >= 0 ? flagged : opts.length > 1 ? 1 : 0;
  return opts.map((opt, i) => {
    const price = round2(Number(opt.price));
    const compareRaw =
      opt.compareAt != null && Number.isFinite(Number(opt.compareAt))
        ? Number(opt.compareAt)
        : price * 1.42;
    const badge =
      typeof opt.badge === "string" && opt.badge.trim()
        ? opt.badge.trim()
        : TIER_BADGES[Math.min(i, TIER_BADGES.length - 1)]!;
    const subtitle =
      typeof opt.subtitle === "string" && opt.subtitle.trim()
        ? opt.subtitle.trim()
        : MOBILE_SUBS[Math.min(i, MOBILE_SUBS.length - 1)]!;
    return {
      id: `q-${i}-${opt.qty}`,
      badge,
      qtyLabel: Number(opt.qty).toLocaleString("en-US"),
      unitWord,
      price,
      compareAt: round2(compareRaw),
      popular: i === popularIndex,
      mobileSubtitle: subtitle,
    };
  });
}

/** Package tiers for SMM product pages (admin-defined or four defaults from category). */
export function getSmmDisplayTiers(service: SMMService): SmmDisplayTier[] {
  const custom = service.quantityOptions;
  if (custom && custom.length > 0) {
    return tiersFromQuantityOptions(service, custom);
  }
  const cat = (QTY_BY_CATEGORY as Record<string, [string, string, string, string]>)[service.category]
    ? service.category
    : ("followers" as SMMCategory);
  const qty = QTY_BY_CATEGORY[cat];
  const unitWord = UNIT_WORD[cat];
  return [0, 1, 2, 3].map((i) => ({
    id: ["starter", "popular", "growth", "elite"][i]!,
    badge: TIER_BADGES[i]!,
    qtyLabel: qty[i]!,
    unitWord,
    price: round2(service.priceFrom * PRICE_MULT[i]!),
    compareAt: round2(service.priceFrom * PRICE_MULT[i]! * COMPARE_MULT[i]!),
    popular: i === 1,
    mobileSubtitle: MOBILE_SUBS[i]!,
  }));
}

export function getPremiumTiers(service: PremiumService): PriceTier[] {
  if (service.billing === "yearly") {
    return [
      {
        id: "annual",
        label: "Annual",
        price: service.priceFrom,
        description: "Billed once per year — best savings",
      },
      {
        id: "trial",
        label: "3-month",
        price: round2(service.priceFrom * 0.35),
        description: "Short-term access",
      },
    ];
  }
  if (service.billing === "one-time") {
    return [
      {
        id: "standard",
        label: "Standard",
        price: service.priceFrom,
        description: "Full access — one payment",
      },
    ];
  }
  return [
    {
      id: "monthly",
      label: "Monthly",
      price: service.priceFrom,
      description: "Cancel anytime",
    },
    {
      id: "quarter",
      label: "3 months",
      price: round2(service.priceFrom * 2.6),
      description: "Save vs monthly",
    },
  ];
}

/** Checkout rows for premium product pages (desktop sidebar + mobile cards). */
export type PremiumDisplayPlan = {
  id: string;
  headline: string;
  sub: string;
  price: number;
  compareAt?: number;
  featured?: boolean;
};

export function getPremiumDisplayPlans(service: PremiumService): PremiumDisplayPlan[] {
  const custom = service.quantityOptions;
  if (custom && custom.length > 0) {
    return custom.map((opt, i) => ({
      id: `q-${i}-${opt.qty}`,
      headline:
        typeof opt.badge === "string" && opt.badge.trim()
          ? opt.badge.trim()
          : `${opt.qty} mo${opt.qty === 1 ? "" : "s"}`,
      sub: typeof opt.subtitle === "string" && opt.subtitle.trim() ? opt.subtitle.trim() : " ",
      price: opt.price,
      compareAt: opt.compareAt != null && Number.isFinite(opt.compareAt) ? opt.compareAt : undefined,
      featured: opt.popular === true,
    }));
  }

  const p = service.priceFrom;
  if (service.billing === "one-time") {
    return [
      {
        id: "standard",
        headline: "Full access",
        sub: "One-time payment — instant delivery",
        price: p,
        featured: true,
      },
    ];
  }
  if (service.billing === "yearly") {
    return [
      {
        id: "12m",
        headline: "12 months",
        sub: "Billed annually — best savings",
        price: p,
        compareAt: round2(p * 1.22),
        featured: true,
      },
      {
        id: "3m",
        headline: "3 months",
        sub: "Short-term access",
        price: round2(p * 0.35),
      },
      {
        id: "1m",
        headline: "1 month",
        sub: "Try before you commit",
        price: round2(p / 12),
      },
    ];
  }
  return [
    {
      id: "1m",
      headline: "1 month plan",
      sub: "Billed monthly",
      price: p,
    },
    {
      id: "3m",
      headline: "3 months plan",
      sub: "Billed quarterly",
      price: round2(p * 2.6),
    },
    {
      id: "12m",
      headline: "12 months plan",
      sub: "Annual savings — ~18% off",
      price: round2(p * 12 * 0.82),
      compareAt: round2(p * 12),
      featured: true,
    },
  ];
}

export type PremiumBentoItem = { title: string; body: string };

export function getPremiumBentoItems(category: PremiumCategory): PremiumBentoItem[] {
  const streaming: PremiumBentoItem[] = [
    {
      title: "4K Ultra HD streaming",
      body: "Highest available resolution with HDR and Dolby Vision where the catalog supports it.",
    },
    {
      title: "Multiple simultaneous screens",
      body: "Watch on TV, laptop, phone, and tablet at the same time — perfect for households.",
    },
    {
      title: "No ads on supported tiers",
      body: "Uninterrupted movies and shows without ad breaks on eligible plans.",
    },
    {
      title: "Instant delivery",
      body: "Credentials are sent to your email right after successful payment.",
    },
  ];
  const music: PremiumBentoItem[] = [
    {
      title: "Ad-free listening",
      body: "Stream without interruptions and download for offline playback on supported apps.",
    },
    {
      title: "High-quality audio",
      body: "Enjoy improved bitrate and clarity where the platform offers it.",
    },
    {
      title: "Multi-device",
      body: "Use your phone, desktop, and smart speakers with one entitlement.",
    },
    {
      title: "Instant delivery",
      body: "Invite links or logins arrive by email moments after checkout.",
    },
  ];
  const gaming: PremiumBentoItem[] = [
    {
      title: "Premium perks",
      body: "HD streaming, larger uploads, and profile upgrades where applicable.",
    },
    {
      title: "Fast activation",
      body: "Redeem or upgrade without waiting on manual processing.",
    },
    {
      title: "Multi-device",
      body: "Use across desktop and mobile clients that support the product.",
    },
    {
      title: "Instant delivery",
      body: "Delivery details are emailed immediately after payment.",
    },
  ];
  const productivity: PremiumBentoItem[] = [
    {
      title: "Full feature access",
      body: "Use the creative or productivity suite as described for your plan.",
    },
    {
      title: "Team-ready",
      body: "Shared or named seats depending on the listing — check seats before checkout.",
    },
    {
      title: "Renewal clarity",
      body: "Know your billing cycle and warranty window before you buy.",
    },
    {
      title: "Instant delivery",
      body: "Setup instructions and credentials go to your inbox right away.",
    },
  ];
  const vpn: PremiumBentoItem[] = [
    {
      title: "Global nodes",
      body: "Connect through high-speed regions optimized for streaming and browsing.",
    },
    {
      title: "Strong encryption",
      body: "Traffic is protected with modern protocols on supported clients.",
    },
    {
      title: "Multi-device",
      body: "Cover phones, laptops, and tablets within your plan limits.",
    },
    {
      title: "Instant delivery",
      body: "Keys and setup steps are emailed as soon as payment clears.",
    },
  ];
  const map: Record<PremiumCategory, PremiumBentoItem[]> = {
    streaming,
    music,
    gaming,
    productivity,
    vpn,
  };
  return map[category] ?? streaming;
}

export const DEFAULT_SMM_FEATURES = [
  "Secure encrypted checkout",
  "Order tracking in dashboard",
  "Eligible tiers include refill window",
  "24/7 human support",
  "No password sharing required for most packages",
];

export const DEFAULT_PREMIUM_FEATURES = [
  "Credentials delivered by email",
  "Setup instructions included",
  "Warranty on supported plans",
  "24/7 support for access issues",
];

export function getSmmFeatures(service: SMMService): string[] {
  const f = service.features;
  if (!f?.length) return [];
  return f.filter((x) => typeof x === "string" && x.trim().length > 0);
}

export function getSmmFaqs(service: SMMService) {
  if (service.faqs && service.faqs.length > 0) {
    return service.faqs.map((f) => ({ q: f.q, a: f.a }));
  }
  const dur =
    service.duration === "instant"
      ? "Many orders start within minutes; larger packages may use a drip-feed over hours or days."
      : "Delivery windows are shown before checkout and depend on package size.";
  return [
    {
      q: "Is this safe for my account?",
      a: "We use organic-speed delivery patterns and never ask for your password on standard packages, so your profile stays in good standing.",
    },
    {
      q: "How long does delivery take?",
      a: dur,
    },
    {
      q: "What if my followers drop?",
      a: "Eligible tiers include a refill window. Open a ticket with your order ID and we'll review per the service terms.",
    },
    {
      q: "Do you offer custom quantities?",
      a: "Yes — contact support with your target volume and timeline for a tailored quote.",
    },
  ];
}

export function getPremiumFaqs(service: PremiumService) {
  if (service.faqs && service.faqs.length > 0) {
    return service.faqs.map((f) => ({ q: f.q, a: f.a }));
  }
  return [
    {
      q: "Is it safe to use these accounts?",
      a: "We verify sources and deliver through encrypted checkout. Follow the usage limits on your listing to stay within platform terms.",
    },
    {
      q: "How fast is the delivery?",
      a: "Most credentials or invite links arrive by email within minutes. Rare cases may take up to an hour during high load.",
    },
    {
      q: "Can I use it on multiple devices?",
      a: service.seats
        ? `This listing supports: ${service.seats}. Stay within those limits to avoid access issues.`
        : "Check the product card for screen or device limits. Typical streaming-style plans allow multiple simultaneous sessions.",
    },
    {
      q: "What if the account stops working?",
      a: "Open a support ticket with your order ID. Replacement or warranty coverage applies per the product terms and duration you purchased.",
    },
  ];
}

export function getPremiumMobileQuickFaqs(service: PremiumService) {
  return [
    {
      q: "Is this a shared account?",
      a: "Listings are curated per product type — some are private slots, some are shared pools. Read the seats line and description before checkout.",
    },
    {
      q: "How long is the warranty?",
      a: `Warranty tracks your purchased plan length. For “${service.name}”, support will reference your order ID and billing period.`,
    },
  ];
}

export function getRelatedSmm(
  current: SMMService,
  limit = 3,
  catalog: SMMService[] = SMM_SERVICES
): SMMService[] {
  const samePlatform = catalog.filter(
    (s) => s.id !== current.id && s.platform === current.platform
  );
  if (samePlatform.length >= limit) return samePlatform.slice(0, limit);
  return catalog.filter((s) => s.id !== current.id).slice(0, limit);
}

export function getRelatedPremium(
  current: PremiumService,
  limit = 3,
  catalog: PremiumService[] = PREMIUM_SERVICES
): PremiumService[] {
  const sameCat = catalog.filter((s) => s.id !== current.id && s.category === current.category);
  if (sameCat.length >= limit) return sameCat.slice(0, limit);
  return catalog.filter((s) => s.id !== current.id).slice(0, limit);
}
