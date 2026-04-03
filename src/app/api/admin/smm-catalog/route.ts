import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { fetchSmmCatalogAdmin } from "@/lib/smm-catalog-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const result = await fetchSmmCatalogAdmin();
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ platforms: result.platforms });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
