import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicesChrome } from "@/components/layout/services-chrome";
import { PremiumProductClient } from "@/components/product/premium-product-client";
import { getPremiumCatalogForStorefront } from "@/lib/premium-products-api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function findPremium(catalog: Awaited<ReturnType<typeof getPremiumCatalogForStorefront>>, id: string) {
  const k = id.trim();
  return catalog.find((s) => s.id === k || s.id.toLowerCase() === k.toLowerCase()) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const catalog = await getPremiumCatalogForStorefront();
  const p = findPremium(catalog, id);
  if (!p) return { title: "Premium | Curator Market" };
  return {
    title: `${p.name} | Curator Market`,
    description: p.description,
  };
}

export default async function PremiumProductPage({ params }: Props) {
  const { id } = await params;
  const catalog = await getPremiumCatalogForStorefront();
  const product = findPremium(catalog, id);
  if (!product) notFound();

  return (
    <ServicesChrome showFab={false} mobileMainPb="pb-56">
      <PremiumProductClient product={product} catalog={catalog} />
    </ServicesChrome>
  );
}
