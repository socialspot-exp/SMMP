import { NextResponse } from "next/server";
import { fetchPremiumCatalogPublic } from "@/lib/premium-catalog-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchPremiumCatalogPublic();
  if (!result.ok) {
    return NextResponse.json({ error: result.error, categories: [] }, { status: 200 });
  }
  return NextResponse.json({ categories: result.categories });
}
