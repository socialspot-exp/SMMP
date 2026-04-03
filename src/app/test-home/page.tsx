import type { Metadata } from "next";
import { LuminousHomePreview } from "@/components/home/luminous-home-preview";

export const metadata: Metadata = {
  title: "Home (Luminous preview) | Curator Market",
  description:
    "Internal style preview: Curator Market homepage content in the Luminous editorial layout.",
  robots: { index: false, follow: false },
};

export default function TestHomePage() {
  return <LuminousHomePreview />;
}
