"use client";

import dynamic from "next/dynamic";

type Props = {
  count?: number;
  sizeClass?: string;
  colorMode?: "brand" | "white";
};

const HeroFlowingSocialIcons = dynamic(
  () => import("./hero-flowing-social-icons").then((m) => m.HeroFlowingSocialIcons),
  { ssr: false }
);

export function HeroFlowingSocialIconsNoSSR(props: Props) {
  return <HeroFlowingSocialIcons {...props} />;
}

