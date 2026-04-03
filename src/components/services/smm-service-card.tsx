"use client";

import Link from "next/link";
import {
  SocialBrandIcon,
  SOCIAL_BRAND_ICON_COLORS,
} from "@/components/home/social-brand";
import { cn } from "@/lib/utils";
import { smmProductPath } from "@/lib/smm-product-helpers";
import type { SMMService } from "@/lib/services-data";
import { SMM_CATEGORIES, SMM_DURATIONS, SMM_PLATFORMS } from "@/lib/services-data";

export function SmmCard({
  service: s,
  featuredLayout,
}: {
  service: SMMService;
  featuredLayout?: boolean;
}) {
  const dur = SMM_DURATIONS.find((d) => d.id === s.duration)?.label ?? s.duration;
  const cat = SMM_CATEGORIES.find((c) => c.id === s.category)?.label ?? s.category;
  const platformLabel =
    SMM_PLATFORMS.find((x) => x.id === s.platform)?.label ?? s.platform;
  const href = smmProductPath(s);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border border-outline-variant/12 bg-surface-container-lowest p-8 shadow-[0_8px_32px_-12px_rgba(44,47,50,0.14)] transition-shadow duration-300 hover:shadow-[0_14px_44px_-16px_rgba(44,47,50,0.2)]",
        featuredLayout && "min-w-[260px] md:min-w-0"
      )}
    >
      <Link
        href={href}
        className="group mb-6 flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
      >
        {s.featured ? (
          <span className="mb-4 inline-block w-fit rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-rose-800 uppercase">
            Featured
          </span>
        ) : null}
        <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/6 transition-transform duration-300 group-hover:scale-[1.03]">
          <SocialBrandIcon
            id={s.platform}
            className={cn("h-7 w-7", SOCIAL_BRAND_ICON_COLORS[s.platform])}
          />
        </div>
        <h3 className="mb-2 font-headline text-base font-bold leading-snug text-on-surface group-hover:text-primary">
          {s.name}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
          {s.description}
        </p>
        <p className="mt-3 text-xs text-on-surface-variant/90">
          {platformLabel}
          <span className="text-on-surface-variant/50"> · </span>
          {cat}
          <span className="text-on-surface-variant/50"> · </span>
          {dur}
        </p>
      </Link>
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-outline-variant/15 pt-6">
        <div>
          <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            From
          </span>
          <p className="font-headline text-2xl font-black tracking-tight text-on-surface tabular-nums">
            ${s.priceFrom.toFixed(2)}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-xl bg-primary px-6 py-3 font-headline text-sm font-bold tracking-wide text-white uppercase shadow-md shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Buy now
        </Link>
      </div>
    </article>
  );
}
