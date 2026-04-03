import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { fetchPremiumCatalogAdmin } from "@/lib/premium-catalog-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const result = await fetchPremiumCatalogAdmin();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ categories: result.categories });
}
