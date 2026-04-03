import { PenTool } from "lucide-react";
import { FaAmazon } from "react-icons/fa6";
import {
  SiDiscord,
  SiHbomax,
  SiNetflix,
  SiProtonvpn,
  SiSpotify,
} from "react-icons/si";
import { cn } from "@/lib/utils";
import type { PremiumBrandId } from "@/lib/services-data";

type Props = {
  brandId: PremiumBrandId;
  productName: string;
  fallbackLetter: string;
  /** Default `lg` matches product hero; `md` for cart rows. */
  size?: "lg" | "md";
};

export function PremiumBrandMark({
  brandId,
  productName,
  fallbackLetter,
  size = "lg",
}: Props) {
  const label = `${productName} logo`;
  const tile = cn(
    "flex shrink-0 items-center justify-center overflow-hidden",
    size === "lg"
      ? "h-24 w-24 rounded-2xl shadow-lg ring-1 ring-black/5"
      : "h-16 w-16 rounded-xl shadow-md ring-1 ring-black/10"
  );
  const ic = size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const pen = size === "lg" ? "h-12 w-12" : "h-8 w-8";
  const letter = size === "lg" ? "text-5xl" : "text-2xl";

  if (brandId === "netflix") {
    return (
      <div className={cn(tile, "bg-black")} aria-label={label}>
        <SiNetflix className={cn(ic, "text-[#E50914]")} aria-hidden />
      </div>
    );
  }

  if (brandId === "prime") {
    return (
      <div className={cn(tile, "bg-white")} aria-label={label}>
        <FaAmazon className={cn(ic, "text-[#FF9900]")} aria-hidden />
      </div>
    );
  }

  if (brandId === "spotify") {
    return (
      <div className={cn(tile, "bg-black")} aria-label={label}>
        <SiSpotify className={cn(ic, "text-[#1DB954]")} aria-hidden />
      </div>
    );
  }

  if (brandId === "discord") {
    return (
      <div className={cn(tile, "bg-[#5865F2]")} aria-label={label}>
        <SiDiscord className={cn(ic, "text-white")} aria-hidden />
      </div>
    );
  }

  if (brandId === "creative") {
    return (
      <div className={cn(tile, "bg-[#EB1000]")} aria-label={label}>
        <PenTool className={cn(pen, "text-white")} strokeWidth={1.75} aria-hidden />
      </div>
    );
  }

  if (brandId === "vpn") {
    return (
      <div className={cn(tile, "bg-[#6d4aff]")} aria-label={label}>
        <SiProtonvpn className={cn(ic, "text-white")} aria-hidden />
      </div>
    );
  }

  if (brandId === "hbomax") {
    return (
      <div className={cn(tile, "bg-[#5822B4]")} aria-label={label}>
        <SiHbomax className={cn(ic, "text-white")} aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={cn(tile, "bg-tertiary font-headline font-black text-white", letter)}
      aria-label={label}
    >
      {fallbackLetter}
    </div>
  );
}
