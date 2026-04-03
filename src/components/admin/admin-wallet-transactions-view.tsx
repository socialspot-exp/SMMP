"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  userId: string;
  email: string;
  userNo: number | null;
  username: string | null;
  amount: number;
  reason: string;
  actorId: string | null;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
};

export function AdminWalletTransactionsView({
  rows,
  fetchError,
}: {
  rows: Row[];
  fetchError: string | null;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.userId,
        r.email,
        r.userNo != null ? String(r.userNo) : "",
        r.username ?? "",
        r.reason,
        r.actorId ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, rows]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      {fetchError ? (
        <div
          className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container"
          role="alert"
        >
          <strong className="font-semibold">Could not load transactions.</strong> {fetchError}
        </div>
      ) : null}

      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Wallet Transactions
        </h1>
        <p className="mt-1 text-sm font-medium text-on-surface-variant">
          Admin adjustments and wallet activity across all users
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-on-surface-variant stroke-[1.75]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by user, email, reason, actor..."
            className="w-full rounded-lg border-none bg-surface py-2 pr-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:ring-1 focus:ring-primary/40 focus:outline-none"
          />
        </div>
        <div className="text-xs font-medium text-on-surface-variant">
          Showing <span className="font-bold text-on-surface">{filtered.length}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  User
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
                  Actor
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-sm text-on-surface-variant">
                    No transactions.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-surface">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-on-surface">
                        {r.email}
                      </div>
                      <div className="text-[11px] text-on-surface-variant/80">
                        {r.userNo != null ? `#${r.userNo}` : r.userId}
                        {r.username ? ` · @${r.username}` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {r.reason}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                          r.amount >= 0
                            ? "bg-green-100 text-green-700"
                            : "bg-error-container/30 text-on-error-container"
                        )}
                      >
                        {r.amount >= 0 ? (
                          <ArrowDownLeft className="size-4 stroke-2" aria-hidden />
                        ) : (
                          <ArrowUpRight className="size-4 stroke-2" aria-hidden />
                        )}
                        {r.amount >= 0 ? "+" : "-"}${Math.abs(r.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      ${Number(r.balanceAfter).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">
                      {r.actorId ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(r.createdAt))}
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

