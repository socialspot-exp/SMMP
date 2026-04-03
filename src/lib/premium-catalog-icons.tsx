import type { SVGProps } from "react";
import type { IconType } from "react-icons";
import {
  SiApplemusic,
  SiAppletv,
  SiCrunchyroll,
  SiEpicgames,
  SiExpressvpn,
  SiHbomax,
  SiMax,
  SiMullvad,
  SiNetflix,
  SiNordvpn,
  SiOpenvpn,
  SiParamountplus,
  SiPlaystation,
  SiPrivateinternetaccess,
  SiProtonvpn,
  SiRoku,
  SiSpotify,
  SiSteam,
  SiSurfshark,
  SiTubi,
  SiTwitch,
  SiYoutube,
  SiYoutubemusic,
} from "react-icons/si";
import { TbBrandDisney, TbBrandHbo, TbBrandXbox } from "react-icons/tb";
import {
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_OPTIONS,
  type CategoryIconName,
} from "@/lib/category-icons";
import { cn } from "@/lib/utils";

/** Twin-pill mark in Hulu green — not an official logo; reads as “Hulu-like” in the picker. */
function IconHulu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <rect x="3" y="6" width="7" height="12" rx="3.5" />
      <rect x="14" y="6" width="7" height="12" rx="3.5" />
    </svg>
  );
}

const PREMIUM_BRAND_ICONS = {
  Netflix: SiNetflix,
  Hulu: IconHulu as IconType,
  Disney: TbBrandDisney,
  HBO: TbBrandHbo,
  Max: SiMax,
  HBOMAX: SiHbomax,
  ParamountPlus: SiParamountplus,
  Crunchyroll: SiCrunchyroll,
  Roku: SiRoku,
  Tubi: SiTubi,
  Youtube: SiYoutube,
  YoutubeMusic: SiYoutubemusic,
  AppleTV: SiAppletv,
  AppleMusic: SiApplemusic,
  Spotify: SiSpotify,
  Twitch: SiTwitch,
  Steam: SiSteam,
  EpicGames: SiEpicgames,
  PlayStation: SiPlaystation,
  Xbox: TbBrandXbox,
  NordVPN: SiNordvpn,
  ExpressVPN: SiExpressvpn,
  ProtonVPN: SiProtonvpn,
  Mullvad: SiMullvad,
  Surfshark: SiSurfshark,
  OpenVPN: SiOpenvpn,
  PrivateInternetAccess: SiPrivateinternetaccess,
} as const satisfies Record<string, IconType>;

export type PremiumBrandIconKey = keyof typeof PREMIUM_BRAND_ICONS;

export type PremiumCatalogIconKey = CategoryIconName | PremiumBrandIconKey;

/** `currentColor` for Simple Icons / brand marks on white tiles (monochrome SVG paths). */
export const PREMIUM_BRAND_ICON_COLORS: Record<PremiumBrandIconKey, string> = {
  Netflix: "text-[#E50914]",
  Hulu: "text-[#1CE783]",
  Disney: "text-[#113CCF]",
  HBO: "text-[#000000]",
  Max: "text-[#002BE6]",
  HBOMAX: "text-[#8B00FF]",
  ParamountPlus: "text-[#0064FF]",
  Crunchyroll: "text-[#F47521]",
  Roku: "text-[#662D91]",
  Tubi: "text-[#000000]",
  Youtube: "text-[#FF0000]",
  YoutubeMusic: "text-[#FF0000]",
  AppleTV: "text-[#000000]",
  AppleMusic: "text-[#FA243C]",
  Spotify: "text-[#1DB954]",
  Twitch: "text-[#9146FF]",
  Steam: "text-[#1B2838]",
  EpicGames: "text-[#313131]",
  PlayStation: "text-[#003791]",
  Xbox: "text-[#107C10]",
  NordVPN: "text-[#4687FF]",
  ExpressVPN: "text-[#DA3940]",
  ProtonVPN: "text-[#6D4AFF]",
  Mullvad: "text-[#192E45]",
  Surfshark: "text-[#1CA34A]",
  OpenVPN: "text-[#EA7E20]",
  PrivateInternetAccess: "text-[#4BB749]",
};

export const PREMIUM_CATALOG_ICON_MAP = {
  ...CATEGORY_ICON_MAP,
  ...PREMIUM_BRAND_ICONS,
} as const;

export const PREMIUM_BRAND_ICON_KEYS = Object.keys(PREMIUM_BRAND_ICONS) as PremiumBrandIconKey[];

export const PREMIUM_CATALOG_ICON_OPTIONS = [
  ...CATEGORY_ICON_OPTIONS,
  ...([...PREMIUM_BRAND_ICON_KEYS] as PremiumBrandIconKey[]).sort((a, b) =>
    a.localeCompare(b)
  ),
] as const satisfies readonly PremiumCatalogIconKey[];

export const PREMIUM_ICON_SELECT_GROUPS: {
  label: string;
  keys: readonly PremiumCatalogIconKey[];
}[] = [
  { label: "Generic (Lucide)", keys: CATEGORY_ICON_OPTIONS },
  {
    label: "Streaming & TV",
    keys: [
      "Netflix",
      "Hulu",
      "Disney",
      "HBO",
      "Max",
      "HBOMAX",
      "ParamountPlus",
      "Crunchyroll",
      "Roku",
      "Tubi",
      "Youtube",
      "YoutubeMusic",
      "AppleTV",
    ],
  },
  {
    label: "Music & live",
    keys: ["Spotify", "AppleMusic", "Twitch"],
  },
  {
    label: "Gaming",
    keys: ["Steam", "EpicGames", "PlayStation", "Xbox"],
  },
  {
    label: "VPN & privacy",
    keys: [
      "NordVPN",
      "ExpressVPN",
      "ProtonVPN",
      "Mullvad",
      "Surfshark",
      "OpenVPN",
      "PrivateInternetAccess",
    ],
  },
];

function isBrandIconKey(k: PremiumCatalogIconKey): k is PremiumBrandIconKey {
  return k in PREMIUM_BRAND_ICONS;
}

export function premiumCatalogIconColorClass(key: PremiumCatalogIconKey): string {
  if (isBrandIconKey(key)) return PREMIUM_BRAND_ICON_COLORS[key];
  return "text-primary";
}

export function isPremiumCatalogIconKey(s: string): s is PremiumCatalogIconKey {
  return s in PREMIUM_CATALOG_ICON_MAP;
}

export function PremiumCatalogIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const key: PremiumCatalogIconKey = isPremiumCatalogIconKey(name) ? name : "Sparkles";
  const Icon = PREMIUM_CATALOG_ICON_MAP[key];
  const brand = isBrandIconKey(key);
  return (
    <Icon
      className={cn(!brand && "stroke-[1.75]", className)}
      aria-hidden
    />
  );
}
