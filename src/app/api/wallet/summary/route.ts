import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, wallet_balance")
    .eq("id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Failed to load balance" }, { status: 500 });

  return NextResponse.json({
    balance: profile?.wallet_balance != null ? Number(profile.wallet_balance) : 0,
  });
}

