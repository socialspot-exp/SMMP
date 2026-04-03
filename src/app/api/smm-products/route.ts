import { NextResponse } from "next/server";
import { fetchSmmProductsPublic } from "@/lib/smm-products-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetchSmmProductsPublic();
  if (!res.ok) {
    return NextResponse.json({ products: [], error: res.error }, { status: 200 });
  }
  return NextResponse.json({ products: res.products });
}
