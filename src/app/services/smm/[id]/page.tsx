import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicesChrome } from "@/components/layout/services-chrome";
import { SmmProductClient } from "@/components/product/smm-product-client";
import { getSmmProductPageModel } from "@/lib/smm-products-api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function parseRobots(s: string | null | undefined): Metadata["robots"] | undefined {
  if (!s?.trim()) return undefined;
  const t = s.toLowerCase();
  return {
    index: !t.includes("noindex"),
    follow: !t.includes("nofollow"),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: key } = await params;
  const model = await getSmmProductPageModel(key);
  if (!model) return { title: "Service | Curator Market" };
  const p = model.product;
  const title = p.metaTitle?.trim() || `${p.name} | Curator Market`;
  const description = (p.metaDescription?.trim() || p.description).slice(0, 320);
  const keywords = p.metaKeywords
    ? p.metaKeywords
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    robots: parseRobots(p.robots),
    openGraph: {
      title: p.metaTitle?.trim() || p.name,
      description,
      images: p.ogImageUrl?.trim() ? [{ url: p.ogImageUrl.trim() }] : undefined,
    },
  };
}

export default async function SmmProductPage({ params }: Props) {
  const { id: key } = await params;
  const model = await getSmmProductPageModel(key);
  if (!model) notFound();

  return (
    <ServicesChrome showFab={false} mobileMainPb="pb-56">
      <SmmProductClient product={model.product} catalog={model.catalog} />
    </ServicesChrome>
  );
}
