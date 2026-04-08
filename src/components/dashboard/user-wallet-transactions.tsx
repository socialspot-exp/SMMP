"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type WalletTxn = {
  id: string;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
};

export function UserWalletTransactions() {
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/wallet/transactions?limit=200", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load transactions");
        const json = (await res.json()) as { transactions: WalletTxn[] };
        if (!alive) return;
        setTxns(Array.isArray(json.transactions) ? json.transactions : []);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load transactions");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-0">
      <div className="flex items-start justify-between gap-3">
        <Link
          href="/dashboard/wallet"
          aria-label="Back"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface"
        >
          <ChevronLeft className="size-4 stroke-2" aria-hidden />
        </Link>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container"
          role="alert"
        >
          <strong className="font-semibold">Could not load transactions.</strong> {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Reason
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Balance After
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-sm text-on-surface-variant">
                    Loading…
                  </td>
                </tr>
              ) : txns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-sm text-on-surface-variant">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                txns.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-surface">
                    <td className="px-6 py-4">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                          t.amount >= 0
                            ? "bg-green-100 text-green-700"
                            : "bg-error-container/30 text-on-error-container"
                        )}
                      >
                        {t.amount >= 0 ? (
                          <ArrowDownLeft className="size-4 stroke-2" aria-hidden />
                        ) : (
                          <ArrowUpRight className="size-4 stroke-2" aria-hidden />
                        )}
                        {t.amount >= 0 ? "Credit" : "Debit"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {t.reason}
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-sm font-bold",
                        t.amount >= 0 ? "text-green-700" : "text-on-surface"
                      )}
                    >
                      {t.amount >= 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      ${Number(t.balanceAfter).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(t.createdAt))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

