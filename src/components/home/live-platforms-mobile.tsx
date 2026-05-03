"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { SocialBrandIcon, type SocialPlatformId } from "@/components/home/social-brand";
import { PremiumBrandMark } from "@/components/product/premium-brand-mark";
import type { PremiumBrandId } from "@/lib/services-data";

type Platform = {
  type: "smm";
  id: SocialPlatformId;
  label: string;
  wrap: string;
};

type Brand = {
  type: "premium";
  id: PremiumBrandId;
  label: string;
};

type LiveItem = Platform | Brand;

const PLATFORM_COLORS: Record<SocialPlatformId, { wrap: string; icon: string }> = {
  instagram: { wrap: "bg-pink-50", icon: "h-6 w-6 text-pink-500" },
  tiktok: { wrap: "bg-blue-50", icon: "h-6 w-6 text-blue-600" },
  facebook: { wrap: "bg-sky-50", icon: "h-6 w-6 text-sky-600" },
  youtube: { wrap: "bg-red-50", icon: "h-6 w-6 text-red-600" },
  spotify: { wrap: "bg-green-50", icon: "h-6 w-6 text-green-600" },
  x: { wrap: "bg-slate-100", icon: "h-6 w-6 text-slate-900" },
  linkedin: { wrap: "bg-blue-100", icon: "h-6 w-6 text-blue-700" },
  discord: { wrap: "bg-indigo-50", icon: "h-6 w-6 text-indigo-600" },
  telegram: { wrap: "bg-cyan-50", icon: "h-6 w-6 text-cyan-600" },
  threads: { wrap: "bg-slate-100", icon: "h-6 w-6 text-slate-900" },
  twitch: { wrap: "bg-purple-50", icon: "h-6 w-6 text-purple-600" },
  reddit: { wrap: "bg-orange-50", icon: "h-6 w-6 text-orange-600" },
  snapchat: { wrap: "bg-yellow-50", icon: "h-6 w-6 text-yellow-600" },
};

const PLATFORM_LABELS: Record<SocialPlatformId, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  spotify: "Spotify",
  x: "X / Twitter",
  linkedin: "LinkedIn",
  discord: "Discord",
  telegram: "Telegram",
  threads: "Threads",
  twitch: "Twitch",
  reddit: "Reddit",
  snapchat: "Snapchat",
};

export function LivePlatformsMobile() {
  const [items, setItems] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [smmRes, premRes] = await Promise.all([
          fetch("/api/smm-products"),
          fetch("/api/premium-products"),
        ]);

        const smmData = await smmRes.json();
        const premData = await premRes.json();

        const platforms = new Set<SocialPlatformId>();
        const brands = new Set<PremiumBrandId>();

        // Extract unique platforms from SMM products
        if (Array.isArray(smmData?.products)) {
          smmData.products.forEach((p: any) => {
            if (p.platform && typeof p.platform === "string") {
              platforms.add(p.platform as SocialPlatformId);
            }
          });
        }

        // Extract unique brands from Premium products
        if (Array.isArray(premData?.products)) {
          premData.products.forEach((p: any) => {
            if (p.brandId && typeof p.brandId === "string") {
              brands.add(p.brandId as PremiumBrandId);
            }
          });
        }

        const liveItems: LiveItem[] = [];

        // Add platform icons (limit to first 5)
        const platformArray = Array.from(platforms).slice(0, 5);
        platformArray.forEach((platformId) => {
          const colors = PLATFORM_COLORS[platformId];
          if (colors) {
            liveItems.push({
              type: "smm",
              id: platformId,
              label: PLATFORM_LABELS[platformId] || platformId,
              wrap: colors.wrap,
            });
          }
        });

        // Add premium brand icons (remaining slots)
        const remainingSlots = 5 - platformArray.length;
        if (remainingSlots > 0) {
          const brandArray = Array.from(brands).slice(0, remainingSlots);
          brandArray.forEach((brandId) => {
            liveItems.push({
              type: "premium",
              id: brandId,
              label: brandId.charAt(0).toUpperCase() + brandId.slice(1),
            });
          });
        }

        setItems(liveItems);
      } catch (err) {
        console.error("Failed to load live platforms:", err);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return (
      <section className="mb-12 px-6">
        <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
          <span className="h-6 w-1.5 rounded-full bg-primary" />
          Select Platform
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  // Show first 5 items + "More" button
  const displayItems = items.slice(0, 5);
  const hasMore = items.length > 5;

  return (
    <section className="mb-12 px-6">
      <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
        <span className="h-6 w-1.5 rounded-full bg-primary" />
        Select Platform
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {displayItems.map((item) => (
          <button
            key={`${item.type}-${item.id}`}
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-transform active:scale-95"
          >
            {item.type === "smm" ? (
              <>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.wrap}`}>
                  <SocialBrandIcon id={item.id} className={PLATFORM_COLORS[item.id]?.icon || "h-6 w-6"} />
                </div>
                <span className="text-center text-[10px] font-bold text-on-surface-variant">
                  {item.label}
                </span>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container">
                  <PremiumBrandMark
                    brandId={item.id}
                    productName={item.label}
                    fallbackLetter={item.label[0] || "P"}
                    size="md"
                  />
                </div>
                <span className="text-center text-[10px] font-bold text-on-surface-variant">
                  {item.label}
                </span>
              </>
            )}
          </button>
        ))}
        {hasMore || displayItems.length < 6 ? (
          <button
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-transform active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container">
              <MoreHorizontal className="h-6 w-6 text-on-surface-variant" strokeWidth={2} aria-hidden />
            </div>
            <span className="text-center text-[10px] font-bold text-on-surface-variant">More</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
