"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Package, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type SmmOrder = {
  id: string;
  orderRef: string;
  apiOrderId: string | null;
  productName: string;
  amount: number;
  quantity: number;
  status: string;
  createdAt: string;
};

function statusPillClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("complete") || s.includes("delivered")) return "bg-emerald-100 text-emerald-800";
  if (s.includes("process") || s.includes("in progress") || s.includes("queued")) return "bg-blue-100 text-blue-700";
  if (s.includes("cancel") || s.includes("fail") || s.includes("refund")) return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-800";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function UserDashboardOrders() {
  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/smm-orders", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : res.statusText);
        setOrders([]);
        return;
      }
      const raw = Array.isArray(data?.orders) ? data.orders : [];
      setOrders(
        raw.map((r: any) => ({
          id: String(r.id),
          orderRef: String(r.orderRef),
          apiOrderId: r.apiOrderId != null ? String(r.apiOrderId) : null,
          productName: String(r.productName),
          amount: Number(r.amount),
          quantity: r.quantity != null ? Number(r.quantity) : 1,
          status: String(r.status),
          createdAt: String(r.createdAt),
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => orders, [orders]);

  async function refreshOne(orderId: string) {
    setRefreshingId(orderId);
    setRefreshError(null);
    try {
      const res = await fetch("/api/smm-orders/refresh-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRefreshError(typeof data?.error === "string" ? data.error : "Failed to refresh status");
        return;
      }
      const nextStatus = typeof data?.status === "string" ? data.status : null;
      if (nextStatus) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
      }
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Failed to refresh status");
    } finally {
      setRefreshingId(null);
    }
  }

  return (
    <div className="px-4 pb-8 pt-4 md:px-0 md:pt-2">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          My orders
        </h1>
        <p className="text-on-surface-variant">
          SMM delivery orders only — progress, status, and target links.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant/10 px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Package className="size-4 shrink-0 text-primary" aria-hidden />
            <h2 className="font-headline text-lg font-bold text-on-surface">SMM orders</h2>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Followers, likes, views, and other social boosts.
          </p>
        </div>
        <div className="space-y-3 p-4 md:p-6">
          {refreshError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {refreshError}
            </p>
          ) : null}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-on-surface-variant">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : null}

          {!loading && error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">No SMM orders yet.</p>
          ) : null}

          {!loading &&
            !error &&
            rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-outline-variant/10 bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between md:gap-4"
              >
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 md:grid-cols-6 md:items-center">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Order ID
                    </span>
                    <div className="mt-0.5 text-[11px] text-on-surface-variant">Site</div>
                    <div className="truncate text-sm font-bold text-on-surface">{row.orderRef}</div>
                    <div className="mt-1 text-[11px] text-on-surface-variant">API</div>
                    <div className="truncate text-sm font-semibold text-on-surface">{row.apiOrderId ?? "—"}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Product
                    </span>
                    <div className="mt-0.5 truncate text-sm font-semibold text-on-surface">{row.productName}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Amount
                    </span>
                    <div className="mt-0.5 text-sm font-bold text-on-surface">${row.amount.toFixed(2)}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Quantity
                    </span>
                    <div className="mt-0.5 text-sm font-bold text-on-surface">{row.quantity}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Date
                    </span>
                    <div className="mt-0.5 text-sm font-semibold text-on-surface">{fmtDate(row.createdAt)}</div>
                  </div>
                  <div className="min-w-0 md:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Status
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-2 md:justify-end">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                          statusPillClass(row.status)
                        )}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => void refreshOne(row.id)}
                    className={cn(
                      "inline-flex items-center justify-center rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface",
                      refreshingId === row.id ? "pointer-events-none opacity-60" : ""
                    )}
                    aria-label="Refresh status"
                  >
                    <RefreshCw
                      className={cn("size-5", refreshingId === row.id ? "animate-spin" : "")}
                      aria-hidden
                    />
                  </button>
                </div>
              </div>
            ))}
        </div>
        <div className="border-t border-outline-variant/10 px-4 py-4 md:px-6">
          <Link href="/services#smm-services" className="text-sm font-bold text-primary hover:underline">
            Browse SMM services
          </Link>
        </div>
      </section>

      {/* No details drawer — status refresh happens per-row via reload icon. */}
    </div>
  );
}
