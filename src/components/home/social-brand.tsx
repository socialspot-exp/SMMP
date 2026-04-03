import type { IconType } from "react-icons";
import { FaLinkedin } from "react-icons/fa6";
import {
  SiDiscord,
  SiFacebook,
  SiInstagram,
  SiReddit,
  SiSnapchat,
  SiSpotify,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiX,
  SiYoutube,
} from "react-icons/si";

export type SocialPlatformId =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "spotify"
  | "x"
  | "linkedin"
  | "discord"
  | "telegram"
  | "threads"
  | "twitch"
  | "reddit"
  | "snapchat";

const icons: Record<SocialPlatformId, IconType> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  facebook: SiFacebook,
  youtube: SiYoutube,
  spotify: SiSpotify,
  x: SiX,
  linkedin: FaLinkedin,
  discord: SiDiscord,
  telegram: SiTelegram,
  threads: SiThreads,
  twitch: SiTwitch,
  reddit: SiReddit,
  snapchat: SiSnapchat,
};

export const ALL_SOCIAL_PLATFORM_IDS = Object.keys(icons) as SocialPlatformId[];

export function isSocialPlatformId(value: string): value is SocialPlatformId {
  return value in icons;
}

export function SocialBrandIcon({
  id,
  className,
}: {
  id: SocialPlatformId;
  className?: string;
}) {
  const Icon = icons[id];
  return <Icon className={className} aria-hidden />;
}

/** White-tile cards: `currentColor` brand hues (Simple Icons are monochrome paths). */
export const SOCIAL_BRAND_ICON_COLORS: Record<SocialPlatformId, string> = {
  instagram: "text-[#E4405F]",
  tiktok: "text-[#000000]",
  facebook: "text-[#1877F2]",
  youtube: "text-[#FF0000]",
  spotify: "text-[#1DB954]",
  x: "text-[#000000]",
  linkedin: "text-[#0A66C2]",
  discord: "text-[#5865F2]",
  telegram: "text-[#0088cc]",
  threads: "text-[#000000]",
  twitch: "text-[#9146FF]",
  reddit: "text-[#FF4500]",
  snapchat: "text-[#000000]",
};

/** Top “Supported Platforms” row — neutral tile, brand fill on hover */
export const PLATFORM_GRID: {
  id: SocialPlatformId;
  label: string;
  tileHover: string;
  iconHover: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    tileHover: "group-hover:bg-primary",
    iconHover: "group-hover:text-on-primary",
  },
  {
    id: "tiktok",
    label: "TikTok",
    tileHover: "group-hover:bg-black",
    iconHover: "group-hover:text-white",
  },
  {
    id: "facebook",
    label: "Facebook",
    tileHover: "group-hover:bg-[#1877F2]",
    iconHover: "group-hover:text-white",
  },
  {
    id: "youtube",
    label: "YouTube",
    tileHover: "group-hover:bg-[#FF0000]",
    iconHover: "group-hover:text-white",
  },
  {
    id: "spotify",
    label: "Spotify",
    tileHover: "group-hover:bg-[#1DB954]",
    iconHover: "group-hover:text-white",
  },
  {
    id: "x",
    label: "X / Twitter",
    tileHover: "group-hover:bg-black",
    iconHover: "group-hover:text-white",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    tileHover: "group-hover:bg-[#0077B5]",
    iconHover: "group-hover:text-white",
  },
  {
    id: "discord",
    label: "Discord",
    tileHover: "group-hover:bg-[#5865F2]",
    iconHover: "group-hover:text-white",
  },
];

/** “Buy more” pill grid — colored circle + logo */
export const PLATFORM_PILLS: {
  id: SocialPlatformId;
  label: string;
  circleClass: string;
  iconClass: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    circleClass:
      "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "tiktok",
    label: "TikTok",
    circleClass: "bg-black",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "facebook",
    label: "Facebook",
    circleClass: "bg-[#1877F2]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "youtube",
    label: "YouTube",
    circleClass: "bg-[#FF0000]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "spotify",
    label: "Spotify",
    circleClass: "bg-[#1DB954]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "x",
    label: "X (Twitter)",
    circleClass: "bg-black",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "telegram",
    label: "Telegram",
    circleClass: "bg-[#0088cc]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "threads",
    label: "Threads",
    circleClass: "bg-black",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    circleClass: "bg-[#0077B5]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "twitch",
    label: "Twitch",
    circleClass: "bg-[#9146FF]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "reddit",
    label: "Reddit",
    circleClass: "bg-[#FF4500]",
    iconClass: "h-6 w-6 text-white",
  },
  {
    id: "snapchat",
    label: "Snapchat",
    circleClass: "bg-[#FFFC00]",
    iconClass: "h-6 w-6 text-black",
  },
];
