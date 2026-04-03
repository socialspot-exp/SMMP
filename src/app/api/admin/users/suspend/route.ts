import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { userId } = body as { userId?: string };
    if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const client = await clerkClient();
    // Prefer ban (strongest) — Clerk API names are stable on backend SDK.
    await client.users.banUser(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Suspend user error:", err);
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
  }
}

