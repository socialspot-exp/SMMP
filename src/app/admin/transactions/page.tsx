import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminWalletTransactionsView } from "@/components/admin/admin-wallet-transactions-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wallet Transactions | Admin",
  description: "Wallet adjustments, top-ups, and charges across all users.",
};

export default async function AdminTransactionsPage() {
  const supabase = createSupabaseAdmin();
  const { data, error } = supabase
    ? await supabase
        .from("wallet_transactions")
        .select(
          "id, user_id, amount, reason, actor_id, balance_before, balance_after, created_at, profiles(email, user_no, username)"
        )
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: null, error: { message: "Database unavailable" } };

  const rows =
    (data ?? []).map((r: any) => ({
      id: String(r.id),
      userId: String(r.user_id),
      email: r.profiles?.email ?? "—",
      userNo: r.profiles?.user_no != null ? Number(r.profiles.user_no) : null,
      username: r.profiles?.username ?? null,
      amount: Number(r.amount),
      reason: String(r.reason ?? ""),
      actorId: r.actor_id ? String(r.actor_id) : null,
      balanceBefore: Number(r.balance_before),
      balanceAfter: Number(r.balance_after),
      createdAt: String(r.created_at),
    })) as any[];

  const fetchError = error ? (error as any).message ?? "Failed to load transactions" : null;

  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
        <AdminWalletTransactionsView rows={rows} fetchError={fetchError} />
      </div>
      <div className="min-h-screen bg-surface lg:hidden">
        <AdminWalletTransactionsView rows={rows} fetchError={fetchError} />
      </div>
    </>
  );
}

