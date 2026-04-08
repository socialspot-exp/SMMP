"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CreditCard, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type WalletTxn = {
  id: string;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
};

const TOP_UP_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function UserDashboardWallet() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [sRes, tRes] = await Promise.all([
          fetch("/api/wallet/summary", { cache: "no-store" }),
          fetch("/api/wallet/transactions?limit=20", { cache: "no-store" }),
        ]);
        if (!sRes.ok) throw new Error("Failed to load wallet balance");
        if (!tRes.ok) throw new Error("Failed to load wallet transactions");
        const s = (await sRes.json()) as { balance: number };
        const t = (await tRes.json()) as { transactions: WalletTxn[] };
        if (!alive) return;
        setBalance(Number(s.balance) || 0);
        setTxns(Array.isArray(t.transactions) ? t.transactions : []);
      } catch (e) {
        if (!alive) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load wallet");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, []);

  const lastUpdatedLabel = useMemo(() => {
    const iso = txns[0]?.createdAt;
    if (!iso) return "—";
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
  }, [txns]);

  const handleTopUp = () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please select or enter a valid amount");
      return;
    }
    alert(`Top-up of $${amount.toFixed(2)} initiated (payment integration pending)`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:space-y-6 md:p-0">
      {loadError ? (
        <div
          className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container"
          role="alert"
        >
          <strong className="font-semibold">Could not load wallet.</strong> {loadError}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-dim to-primary-dark p-6 text-on-primary shadow-xl shadow-primary/20 md:p-8">
          <Wallet
            className="pointer-events-none absolute -right-6 -bottom-6 size-40 stroke-[0.5] text-white/10"
            aria-hidden
          />
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest uppercase opacity-80">
              Available Balance
            </p>
            <p className="mt-2 font-headline text-5xl font-extrabold md:text-6xl">
              ${loading ? "—" : balance.toFixed(2)}
            </p>
            <p className="mt-4 text-xs opacity-70">
              Last updated: {loading ? "—" : lastUpdatedLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm md:p-8">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              Top-up Wallet
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Select or enter an amount to add funds
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TOP_UP_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount("");
                }}
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm font-bold transition-all",
                  selectedAmount === amt
                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "border-outline-variant/20 bg-surface text-on-surface hover:border-primary/40 hover:bg-surface-container-low"
                )}
              >
                ${amt}
              </button>
            ))}
          </div>

          <div className="relative">
            <DollarSign
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-on-surface-variant stroke-[1.75]"
              aria-hidden
            />
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              className="w-full rounded-lg border border-outline-variant/20 bg-surface py-3 pr-4 pl-10 text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleTopUp}
            disabled={!selectedAmount && !customAmount}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <CreditCard className="size-5 stroke-[1.75]" aria-hidden />
            Add Funds
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant/10 px-6 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Transaction History</h2>
              <p className="text-xs text-on-surface-variant">
                Recent wallet activity and order charges
              </p>
            </div>
            <Link
              href="/dashboard/wallet/transactions"
              className="rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="divide-y divide-outline-variant/5">
          {txns.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-surface"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    tx.amount >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-error-container/30 text-on-error-container"
                  )}
                >
                  {tx.amount >= 0 ? (
                    <ArrowDownLeft className="size-5 stroke-2" aria-hidden />
                  ) : (
                    <ArrowUpRight className="size-5 stroke-2" aria-hidden />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{tx.reason}</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(tx.createdAt))}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "text-sm font-bold",
                  tx.amount >= 0 ? "text-green-700" : "text-on-surface"
                )}
              >
                {tx.amount >= 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {!loading && txns.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-on-surface-variant">
            No transactions yet. Top-up your wallet to get started!
          </div>
        )}
      </div>
    </div>
  );
}
