import { NextResponse } from "next/server";
import { fetchPremiumProductsPublic } from "@/lib/premium-products-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchPremiumProductsPublic();
  if (!result.ok) {
    return NextResponse.json({ error: result.error, products: [] }, { status: 200 });
  }
  return NextResponse.json({ products: result.products });
}
