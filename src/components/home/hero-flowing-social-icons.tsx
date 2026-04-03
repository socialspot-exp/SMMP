"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ALL_SOCIAL_PLATFORM_IDS, SOCIAL_BRAND_ICON_COLORS, SocialBrandIcon } from "@/components/home/social-brand";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** How many icons to render in the flow */
  count?: number;
  /** Icon size in Tailwind units (applied to the icon's `className`) */
  sizeClass?: string;
  /** Use white-ish icons for light/bright backgrounds */
  colorMode?: "brand" | "white";
};

export function HeroFlowingSocialIcons({
  count = 12,
  sizeClass = "h-7 w-7",
  colorMode = "brand",
}: Props) {
  const reduce = useReducedMotion();
  // This component is always consumed via `HeroFlowingSocialIconsNoSSR` (ssr: false),
  // so it's safe to randomize at render-time without hydration mismatches.
  const items = useMemo(() => generateItems(count), [count]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {items.map((it, i) => {
        const colorClass = colorMode === "white" ? "text-white" : cn(SOCIAL_BRAND_ICON_COLORS[it.iconId], "");
        return (
          <motion.div
            key={`${it.iconId}-${i}`}
            className="absolute"
            style={{
              top: `${it.topPct}%`,
              left: `${it.leftPct}%`,
              opacity: it.opacity,
              willChange: "transform",
            }}
            animate={
              reduce
                ? { x: 0, y: 0, scale: it.scale, opacity: it.opacity }
                : {
                    x: [0, it.dx, 0],
                    y: [0, it.dy, 0],
                    scale: [it.scale * 0.98, it.scale * 1.04, it.scale * 0.98],
                    opacity: [it.opacity * 0.85, it.opacity * 1.05, it.opacity * 0.85],
                  }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: it.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: it.delay,
                  }
            }
          >
            <SocialBrandIcon id={it.iconId} className={cn(sizeClass, colorClass)} />
          </motion.div>
        );
      })}
    </div>
  );
}

function rand01() {
  // Prefer crypto-based randomness (better than Math.random)
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0]! / 0xffffffff;
  }
  return Math.random();
}

function clampCount(count: number) {
  return Math.round(Math.min(40, Math.max(8, count)));
}

function generateItems(count: number) {
  const n = clampCount(count);
  const ids = ALL_SOCIAL_PLATFORM_IDS;
  return Array.from({ length: n }).map((_, i) => {
    const iconId = ids[i % ids.length]!;
    const leftPct = rand01() * 100;
    // Let icons fill the whole hero background.
    const topPct = rand01() * 100;
    const opacity = 0.24 + rand01() * 0.42; // 0.24 - 0.66
    const scale = 0.7 + rand01() * 0.85; // 0.7 - 1.55
    const dx = -140 + rand01() * 280; // horizontal drift
    const dy = -34 + rand01() * 68; // vertical drift
    const duration = 9 + rand01() * 16; // 9 - 25s
    const delay = rand01() * 5; // 0 - 5s
    return { iconId, leftPct, topPct, opacity, scale, dx, dy, duration, delay };
  });
}

