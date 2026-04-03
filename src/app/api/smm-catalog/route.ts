import { NextResponse } from "next/server";
import { fetchSmmCatalogPublic } from "@/lib/smm-catalog-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchSmmCatalogPublic();
  if (!result.ok) {
    return NextResponse.json({ error: result.error, platforms: [] }, { status: 200 });
  }
  return NextResponse.json({ platforms: result.platforms });
}
