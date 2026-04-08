"use client";

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PremiumCatalogIcon, isPremiumCatalogIconKey, type PremiumCatalogIconKey } from "@/lib/premium-catalog-icons";

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

function extractIconFromProductName(productName: string): PremiumCatalogIconKey {
  const name = productName.toLowerCase();
  if (name.includes("netflix")) return "Netflix";
  if (name.includes("spotify")) return "Spotify";
  if (name.includes("disney")) return "Disney";
  if (name.includes("hbo") || name.includes("max")) return "Max";
  if (name.includes("paramount")) return "ParamountPlus";
  if (name.includes("hulu")) return "Hulu";
  if (name.includes("youtube")) return "Youtube";
  if (name.includes("apple tv")) return "AppleTV";
  if (name.includes("apple music")) return "AppleMusic";
  if (name.includes("twitch")) return "Twitch";
  if (name.includes("steam")) return "Steam";
  if (name.includes("epic")) return "EpicGames";
  if (name.includes("playstation") || name.includes("ps plus")) return "PlayStation";
  if (name.includes("xbox")) return "Xbox";
  if (name.includes("nordvpn")) return "NordVPN";
  if (name.includes("expressvpn")) return "ExpressVPN";
  if (name.includes("protonvpn")) return "ProtonVPN";
  if (name.includes("crunchyroll")) return "Crunchyroll";
  return "Sparkles";
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
    <div className="px-4 pb-32 pt-2 md:px-0 md:pt-0 md:pb-8">
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
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low shadow-sm">
                    <PremiumCatalogIcon
                      name={extractIconFromProductName(row.productName)}
                      className="size-7"
                    />
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-primary/20 bg-surface-container-lowest shadow-2xl shadow-primary/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Eye className="size-5 text-primary" aria-hidden />
                </div>
                <h3 className="font-headline text-xl font-bold text-primary">Credentials</h3>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                aria-label="Close"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              {viewError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{viewError}</p>
              ) : null}

              <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-primary/10 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-black text-on-surface">{viewOrder.orderRef}</p>
                    <p className="mt-1 truncate text-sm text-on-surface-variant">{viewOrder.productName}</p>
                    <p className="mt-2 text-xs text-primary/70">
                      Provided: {formatDate(viewOrder.credentialsProvidedAt) ?? "—"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase text-on-primary shadow-sm">
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
                  <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <p className="text-xs font-black tracking-wider text-primary uppercase">
                        Credentials
                      </p>
                    </div>

                    {viewCredItems && viewCredItems.length > 0 ? (
                      <div className="space-y-3">
                        {viewCredItems.map((it, idx) => (
                          <div key={`${idx}-${it.key}`} className="rounded-lg border border-primary/10 bg-surface-container-lowest p-4 hover:border-primary/20 transition-colors">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                              {it.key}
                            </p>
                            <p className="mt-2 wrap-break-word text-sm font-mono text-on-surface">
                              {it.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : viewCreds && Object.keys(viewCreds).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(viewCreds).map(([k, v]) => (
                          <div key={k} className="rounded-lg border border-primary/10 bg-surface-container-lowest p-4 hover:border-primary/20 transition-colors">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                              {k}
                            </p>
                            <p className="mt-2 wrap-break-word text-sm font-mono text-on-surface">
                              {v}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant">No credentials stored yet for this order.</p>
                    )}
                  </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}

