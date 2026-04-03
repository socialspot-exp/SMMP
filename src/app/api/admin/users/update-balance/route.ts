import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(req: Request) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const body = await req.json();
    const { userId, balance, reason } = body;

    if (!userId || typeof balance !== "number" || balance < 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, wallet_balance")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const before = profile.wallet_balance != null ? Number(profile.wallet_balance) : 0;
    const after = Number(balance);
    const delta = +(after - before).toFixed(2);

    const { error } = await supabase.from("profiles").update({ wallet_balance: after }).eq("id", userId);

    if (error) {
      console.error("Failed to update wallet balance:", error);
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    const { error: txnErr } = await supabase.from("wallet_transactions").insert({
      user_id: userId,
      amount: delta,
      reason: typeof reason === "string" && reason.trim() ? reason.trim() : "Admin wallet adjustment",
      actor_id: null,
      balance_before: before,
      balance_after: after,
    });

    if (txnErr) {
      console.error("Failed to insert wallet transaction:", txnErr);
      // balance already updated; still return success to avoid blocking admin workflow
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update balance error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
