"use client";

import { useEffect, useState } from "react";
import { SocialBrandIcon, type SocialPlatformId } from "@/components/home/social-brand";
import { PremiumBrandMark } from "@/components/product/premium-brand-mark";
import type { PremiumBrandId } from "@/lib/services-data";

type Platform = {
  type: "smm";
  id: SocialPlatformId;
  label: string;
  tileHover: string;
  iconHover: string;
};

type Brand = {
  type: "premium";
  id: PremiumBrandId;
  label: string;
};

type LiveItem = Platform | Brand;

const PLATFORM_HOVER_MAP: Record<SocialPlatformId, { tile: string; icon: string }> = {
  instagram: { tile: "group-hover:bg-primary", icon: "group-hover:text-on-primary" },
  tiktok: { tile: "group-hover:bg-black", icon: "group-hover:text-white" },
  facebook: { tile: "group-hover:bg-[#1877F2]", icon: "group-hover:text-white" },
  youtube: { tile: "group-hover:bg-[#FF0000]", icon: "group-hover:text-white" },
  spotify: { tile: "group-hover:bg-[#1DB954]", icon: "group-hover:text-white" },
  x: { tile: "group-hover:bg-black", icon: "group-hover:text-white" },
  linkedin: { tile: "group-hover:bg-[#0077B5]", icon: "group-hover:text-white" },
  discord: { tile: "group-hover:bg-[#5865F2]", icon: "group-hover:text-white" },
  telegram: { tile: "group-hover:bg-[#0088cc]", icon: "group-hover:text-white" },
  threads: { tile: "group-hover:bg-black", icon: "group-hover:text-white" },
  twitch: { tile: "group-hover:bg-[#9146FF]", icon: "group-hover:text-white" },
  reddit: { tile: "group-hover:bg-[#FF4500]", icon: "group-hover:text-white" },
  snapchat: { tile: "group-hover:bg-[#FFFC00]", icon: "group-hover:text-black" },
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

export function LivePlatformsSection() {
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

        // Add platform icons
        Array.from(platforms).forEach((platformId) => {
          const hover = PLATFORM_HOVER_MAP[platformId];
          if (hover) {
            liveItems.push({
              type: "smm",
              id: platformId,
              label: PLATFORM_LABELS[platformId] || platformId,
              tileHover: hover.tile,
              iconHover: hover.icon,
            });
          }
        });

        // Add premium brand icons
        Array.from(brands).forEach((brandId) => {
          liveItems.push({
            type: "premium",
            id: brandId,
            label: brandId.charAt(0).toUpperCase() + brandId.slice(1),
          });
        });

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
      <section className="bg-surface-container-low py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-10 text-center text-sm font-bold tracking-[0.2em] text-on-surface-variant uppercase">
            Supported Platforms
          </p>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-10 text-center text-sm font-bold tracking-[0.2em] text-on-surface-variant uppercase">
          Supported Platforms
        </p>
        <div className="grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-8">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="group flex cursor-pointer flex-col items-center gap-2">
              {item.type === "smm" ? (
                <>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container-lowest shadow-sm transition-all ${item.tileHover}`}
                  >
                    <SocialBrandIcon
                      id={item.id}
                      className={`h-7 w-7 text-on-surface-variant transition-colors ${item.iconHover}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">{item.label}</span>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container-lowest shadow-sm transition-all group-hover:scale-105">
                    <PremiumBrandMark
                      brandId={item.id}
                      productName={item.label}
                      fallbackLetter={item.label[0] || "P"}
                      size="md"
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">{item.label}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
