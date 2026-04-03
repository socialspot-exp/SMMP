"use client";

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CredState = "pending" | "sent" | "failed";

type UserPremiumOrderRow = {
  id: string;
  orderRef: string;
  productName: string;
  deliveryEmail: string;
  submittedForm: Record<string, unknown>;
  vip: boolean;
  price: string | null;
  status: string;
  detail: string | null;
  credentialsState: CredState;
  credentialsProvidedAt: string | null;
  hasUnreadCredentialsNotification: boolean;
};

function statusPillClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("active") || s.includes("complete")) return "bg-emerald-100 text-emerald-800";
  if (s.includes("await") || s.includes("provision") || s.includes("pending"))
    return "bg-amber-100 text-amber-800";
  if (s.includes("refund") || s.includes("cancel") || s.includes("failed"))
    return "bg-rose-100 text-rose-800";
  return "bg-surface-container-lowest text-on-surface-variant";
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function UserDashboardSubscriptions() {
  const [orders, setOrders] = useState<UserPremiumOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [viewCredsLoading, setViewCredsLoading] = useState(false);
  const [viewCreds, setViewCreds] = useState<Record<string, string> | null>(null);
  const [viewCredItems, setViewCredItems] = useState<Array<{ key: string; value: string }> | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/premium-orders", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(typeof data?.error === "string" ? data.error : res.statusText);
        setOrders([]);
        return;
      }
      setOrders(Array.isArray(data?.orders) ? (data.orders as UserPremiumOrderRow[]) : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load subscriptions");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const viewOrder = useMemo(() => orders.find((o) => o.id === viewOrderId) ?? null, [orders, viewOrderId]);

  async function openViewCredentials(order: UserPremiumOrderRow) {
    setViewOrderId(order.id);
    setViewError(null);
    setViewCredsLoading(true);
    setViewCreds(null);
    setViewCredItems(null);
    try {
      const res = await fetch(`/api/premium-orders/${encodeURIComponent(order.id)}/credentials`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setViewError(typeof data?.error === "string" ? data.error : res.statusText);
        return;
      }
      // Prefer ordered pairs; fall back to object map.
      if (Array.isArray(data?.credentialsItems)) {
        const items = data.credentialsItems as Array<{ key: string; value: string }>;
        setViewCredItems(items);
        setViewCreds(
          items.reduce((acc: Record<string, string>, it) => {
            acc[it.key] = it.value;
            return acc;
          }, {})
        );
      } else {
        setViewCredItems(null);
        setViewCreds(data?.credentials ?? null);
      }
      // Refresh list to clear "New" badge (API marks notifications as read).
      void loadOrders();
    } catch (e) {
      setViewError(e instanceof Error ? e.message : "Failed to load credentials");
    } finally {
      setViewCredsLoading(false);
    }
  }

  function closeDrawer() {
    setViewOrderId(null);
    setViewCredsLoading(false);
    setViewCreds(null);
    setViewCredItems(null);
    setViewError(null);
  }

  return (
    <div className="px-4 pb-8 pt-4 md:px-0 md:pt-2">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          Subscriptions
        </h1>
        <p className="text-on-surface-variant">Premium account orders only — streaming, apps, credentials, and renewals.</p>
      </div>

      <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant/10 px-4 py-4 md:px-6">
          <h2 className="font-headline text-lg font-bold text-on-surface">Premium account orders</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Active subscriptions, provisioning, and renewal details.</p>
        </div>

        <div className="space-y-3 p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-on-surface-variant">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : null}

          {!loading && loadError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {loadError}
            </p>
          ) : null}

          {!loading && !loadError && orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">No premium orders yet.</p>
          ) : null}

          {!loading &&
            !loadError &&
            orders.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-outline-variant/10 bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between md:gap-4"
              >
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 md:grid-cols-3 md:items-center">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Order ID
                    </span>
                    <div className="mt-0.5 truncate text-sm font-bold text-on-surface">{row.orderRef}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Product Name
                    </span>
                    <div className="mt-0.5 truncate text-sm font-semibold text-on-surface">{row.productName}</div>
                  </div>
                  <div className="min-w-0 md:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Order Status
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
                      {row.hasUnreadCredentialsNotification && row.credentialsState === "sent" ? (
                        <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                          New
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    disabled={row.credentialsState !== "sent"}
                    onClick={() => openViewCredentials(row)}
                    className={cn(
                      "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors md:w-auto",
                      row.credentialsState === "sent"
                        ? "bg-primary text-on-primary hover:bg-primary-dim"
                        : "cursor-not-allowed bg-surface-container-low text-on-surface-variant"
                    )}
                  >
                    <Eye className="size-4 stroke-2" aria-hidden />
                    View credentials
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="border-t border-outline-variant/10 px-4 py-4 md:px-6">
          <Link href="/services#premium-services" className="text-sm font-bold text-primary hover:underline">
            Browse premium accounts
          </Link>
        </div>
      </section>

      {viewOrder ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-md flex-col border-l border-outline-variant/15 bg-surface-container-lowest shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-4">
              <div className="flex items-center gap-2">
                <Eye className="size-5 text-primary" aria-hidden />
                <h3 className="font-headline text-lg font-bold text-on-surface">Credentials</h3>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Close"
              >
                X
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {viewError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{viewError}</p>
              ) : null}

              <div className="rounded-2xl border border-outline-variant/10 bg-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-on-surface">{viewOrder.orderRef}</p>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">{viewOrder.productName}</p>
                    <p className="mt-2 text-[11px] text-on-surface-variant">
                      Provided: {formatDate(viewOrder.credentialsProvidedAt) ?? "—"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                    {viewOrder.status}
                  </span>
                </div>
              </div>

              {viewCredsLoading ? (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Loading credentials…
                </div>
              ) : null}

              {!viewCredsLoading ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-outline-variant/10 bg-surface p-4 shadow-sm">
                    <p className="mb-3 text-xs font-black tracking-wider text-on-surface-variant uppercase">
                      Submitted form data
                    </p>
                    {Object.keys(viewOrder.submittedForm ?? {}).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(viewOrder.submittedForm).map(([k, v]) => (
                          <div key={k} className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                              {k}
                            </p>
                            <p className="mt-1 wrap-break-word text-sm font-mono text-on-surface">
                              {typeof v === "string" ? v : JSON.stringify(v)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant">No submitted data stored.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-outline-variant/10 bg-surface p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-black tracking-wider text-on-surface-variant uppercase">
                        Credentials
                      </p>
                    </div>

                    {viewCredItems && viewCredItems.length > 0 ? (
                      <div className="space-y-3">
                        {viewCredItems.map((it, idx) => (
                          <div key={`${idx}-${it.key}`} className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                              {it.key}
                            </p>
                            <p className="mt-1 wrap-break-word text-sm font-mono text-on-surface">
                              {it.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : viewCreds && Object.keys(viewCreds).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(viewCreds).map(([k, v]) => (
                          <div key={k} className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                              {k}
                            </p>
                            <p className="mt-1 wrap-break-word text-sm font-mono text-on-surface">
                              {v}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant">No credentials stored yet for this order.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

