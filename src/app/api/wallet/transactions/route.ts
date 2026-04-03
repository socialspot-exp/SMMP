import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20), 1), 200);

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, amount, reason, balance_before, balance_after, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });

  return NextResponse.json({
    transactions: (data ?? []).map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      reason: t.reason,
      balanceBefore: Number(t.balance_before),
      balanceAfter: Number(t.balance_after),
      createdAt: t.created_at,
    })),
  });
}

