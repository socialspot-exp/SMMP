"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileWarning,
  History,
  KeyRound,
  ListFilter,
  MoreVertical,
  Pencil,
  Loader2,
  Send,
  ShoppingBag,
  Sparkles,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PremiumTab = "all" | "completed" | "pending" | "cancelled";

type CredState = "sent" | "pending" | "failed";

type AdminPremiumOrderRow = {
  id: string;
  orderRef: string;
  timeLine: string;
  customerEmail: string;
  vip: boolean;
  product: string;
  credentials: CredState;
  credentialsProvidedAt: string | null;
  credentialsPayload: Record<string, string>;
  credentialsItems: Array<{ key: string; value: string }>;
  price: string | null;
  status: string;
};

function adminDisplayStatus(rawStatus: string, cred: CredState): string {
  if (cred === "sent" && /await|provision|pending/i.test(rawStatus)) return "Credentials sent";
  return rawStatus;
}

function statusPillClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("complete") || s.includes("active")) return "bg-blue-100 text-blue-700";
  if (s.includes("await") || s.includes("provision") || s.includes("pending")) return "bg-amber-100 text-amber-700";
  if (s.includes("refund") || s.includes("cancel")) return "bg-rose-100 text-rose-700";
  return "bg-surface-container-lowest text-on-surface-variant";
}

function dotClassFromStatus(status: string) {
  const s = status.toLowerCase();
  if (s.includes("complete") || s.includes("active")) return "bg-blue-600";
  if (s.includes("await") || s.includes("provision") || s.includes("pending")) return "bg-amber-500";
  if (s.includes("refund") || s.includes("cancel")) return "bg-rose-500";
  return "bg-primary";
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  // Keep it short to match the existing mock.
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function CredentialsBadge({ state }: { state: CredState }) {
  if (state === "sent") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="mr-1 size-3.5 stroke-2" aria-hidden />
        Sent
      </span>
    );
  }
  if (state === "pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        <History className="mr-1 size-3.5 stroke-2" aria-hidden />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
      <XCircle className="mr-1 size-3.5 stroke-2" aria-hidden />
      Failed
    </span>
  );
}

export function AdminPremiumOrdersView({ className }: { className?: string }) {
  const [tab, setTab] = useState<PremiumTab>("all");

  const [orders, setOrders] = useState<AdminPremiumOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Credentials drawer state (admin provides/edits key/value credentials).
  const [credDrawerOrder, setCredDrawerOrder] = useState<AdminPremiumOrderRow | null>(null);
  const [credPairs, setCredPairs] = useState<Array<{ key: string; value: string }>>([]);
  const [credSaving, setCredSaving] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/premium-orders", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(typeof data?.error === "string" ? data.error : res.statusText);
        setOrders([]);
        return;
      }

      const raw = Array.isArray(data?.orders) ? data.orders : [];
      const mapped: AdminPremiumOrderRow[] = raw.map((o: any) => {
        const timeLine = formatTime(o.credentialsProvidedAt ?? o.createdAt ?? o.updated_at ?? null);
        const credentials = (String(o.credentialsState ?? "pending").toLowerCase() as CredState) || "pending";
        const statusRaw = String(o.status ?? "Provisioning");
        return {
          id: String(o.id),
          orderRef: String(o.orderRef ?? o.order_ref ?? o.orderId ?? ""),
          timeLine: timeLine || "",
          customerEmail: String(o.deliveryEmail ?? o.customerEmail ?? ""),
          vip: Boolean(o.vip),
          product: String(o.productName ?? o.product ?? ""),
          credentials,
          credentialsProvidedAt: o.credentialsProvidedAt ?? null,
          credentialsPayload: (o.credentials && typeof o.credentials === "object" ? o.credentials : {}) as Record<string, string>,
          credentialsItems: Array.isArray(o.credentialsItems) ? (o.credentialsItems as Array<{ key: string; value: string }>) : [],
          price: o.price != null ? String(o.price) : null,
          status: adminDisplayStatus(statusRaw, credentials),
        };
      });

      setOrders(mapped);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load premium orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    if (tab === "completed") {
      return orders.filter((o) => o.credentials === "sent" || /complete|active/i.test(o.status));
    }
    if (tab === "pending") {
      return orders.filter((o) => o.credentials !== "sent" && /await|provision|pending/i.test(o.status));
    }
    // cancelled
    return orders.filter((o) => /refund|cancel/i.test(o.status) || o.credentials === "failed");
  }, [orders, tab]);

  function openCredentialsDrawer(o: AdminPremiumOrderRow) {
    setCredDrawerOrder(o);
    setCredError(null);
    const items = Array.isArray(o.credentialsItems) && o.credentialsItems.length > 0
      ? o.credentialsItems
      : Object.entries(o.credentialsPayload ?? {}).map(([key, value]) => ({ key, value }));
    if (items.length === 0) {
      setCredPairs([{ key: "", value: "" }]);
    } else {
      setCredPairs(items.map((it) => ({ key: it.key, value: it.value })));
    }
  }

  function closeCredentialsDrawer() {
    setCredDrawerOrder(null);
    setCredPairs([]);
    setCredSaving(false);
    setCredError(null);
  }

  async function submitCredentials() {
    if (!credDrawerOrder) return;
    setCredSaving(true);
    setCredError(null);
    try {
      const credentialsItems: Array<{ key: string; value: string }> = [];
      for (const p of credPairs) {
        const k = p.key.trim();
        const v = p.value.trim();
        if (!k || !v) continue;
        credentialsItems.push({ key: k, value: v });
      }

      const res = await fetch("/api/admin/premium-orders/credentials", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: credDrawerOrder.id,
          credentialsItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCredError(typeof data?.error === "string" ? data.error : "Failed to save credentials");
        return;
      }

      closeCredentialsDrawer();
      void loadOrders();
    } catch (e) {
      setCredError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setCredSaving(false);
    }
  }

  const tabBtn = (key: PremiumTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        tab === key
          ? "bg-primary/10 font-bold text-primary"
          : "text-on-surface-variant hover:bg-surface-container"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8", className)}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Premium Orders
          </h2>
          <p className="mt-1 text-on-surface-variant">Manage and track high-value account fulfillment</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-surface-container-low px-5 py-2.5 font-semibold text-on-surface transition-colors hover:bg-surface-container-highest active:scale-[0.98]"
          >
            <Download className="size-4 stroke-[1.75]" aria-hidden />
            Export CSV
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-[0.98]"
          >
            <span className="text-lg leading-none">+</span>
            Manual Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <ShoppingBag className="size-5 stroke-[1.75]" aria-hidden />
            </span>
            <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">+12%</span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">Total Orders Today</p>
          <h3 className="mt-1 text-2xl font-bold">142</h3>
        </div>
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <Clock className="size-5 stroke-[1.75]" aria-hidden />
            </span>
            <span className="text-xs font-bold text-amber-600">Pending</span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">Awaiting Credentials</p>
          <h3 className="mt-1 text-2xl font-bold">18</h3>
        </div>
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <CreditCard className="size-5 stroke-[1.75]" aria-hidden />
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">Daily Revenue</p>
          <h3 className="mt-1 text-2xl font-bold">$2,845.50</h3>
        </div>
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-lg bg-rose-100 p-2 text-rose-600">
              <FileWarning className="size-5 stroke-[1.75]" aria-hidden />
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">Refund Requests</p>
          <h3 className="mt-1 text-2xl font-bold">3</h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container p-6">
          <div className="flex flex-wrap items-center gap-2">
            {tabBtn("all", "All Orders")}
            {tabBtn("completed", "Completed")}
            {tabBtn("pending", "Pending")}
            {tabBtn("cancelled", "Cancelled")}
          </div>
          <div className="flex items-center gap-3">
            <select className="rounded-xl border-none bg-surface-container-low py-2 pr-4 pl-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option>All Products</option>
              <option>Netflix</option>
              <option>Disney+</option>
              <option>Prime Video</option>
              <option>Spotify</option>
            </select>
            <button
              type="button"
              className="rounded-xl bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label="Filters"
            >
              <ListFilter className="size-5 stroke-[1.75]" aria-hidden />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Credentials
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-surface-container-low/30">
                  <td className="px-6 py-5">
                    <span className="font-bold text-on-surface">{o.orderRef}</span>
                    <p className="text-[10px] font-medium text-on-surface-variant">{o.timeLine}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">{o.customerEmail}</span>
                      {o.vip ? <span className="text-[10px] font-bold text-primary">VIP CUSTOMER</span> : null}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClassFromStatus(o.status))} />
                      <span className="font-medium text-on-surface">{o.product}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <CredentialsBadge state={o.credentials} />
                  </td>
                  <td className="px-6 py-5 font-bold text-on-surface">{o.price ?? "-"}</td>
                  <td className="px-6 py-5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                        statusPillClass(o.status)
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-primary transition-colors hover:bg-surface-container-high"
                        title={o.credentials === "sent" ? "Edit credentials" : "Provide credentials"}
                        onClick={() => openCredentialsDrawer(o)}
                      >
                        {o.credentials === "sent" ? (
                          <Pencil className="size-5 stroke-[1.75]" aria-hidden />
                        ) : (
                          <KeyRound className="size-5 stroke-[1.75]" aria-hidden />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-container p-6">
          <p className="text-xs font-medium text-on-surface-variant">
            Showing 1 to {filtered.length} of 2,405 orders
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5 stroke-[1.75]" aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-on-primary"
            >
              1
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container"
            >
              2
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container"
            >
              3
            </button>
            <span className="px-2 text-xs text-on-surface-variant">...</span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container"
            >
              120
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
              aria-label="Next"
            >
              <ChevronRight className="size-5 stroke-[1.75]" aria-hidden />
            </button>
          </div>
        </div>
      </div>

        {credDrawerOrder ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
            <div className="flex h-full w-full max-w-md flex-col border-l border-outline-variant/15 bg-surface-container-lowest shadow-xl animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-outline-variant/10 p-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-5 text-primary" aria-hidden />
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    {credDrawerOrder.credentials === "sent" ? "Edit credentials" : "Provide credentials"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeCredentialsDrawer}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
                  aria-label="Close"
                >
                  <MoreVertical className="size-5" aria-hidden />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {credError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {credError}
                  </p>
                ) : null}

                <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-on-surface">{credDrawerOrder.orderRef}</p>
                      <p className="truncate text-xs text-on-surface-variant">{credDrawerOrder.product}</p>
                      <p className="truncate text-xs text-on-surface-variant">{credDrawerOrder.customerEmail}</p>
                    </div>
                    <CredentialsBadge state={credDrawerOrder.credentials} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Credential fields (key/value)
                  </p>
                  <div className="space-y-2">
                    {credPairs.map((p, idx) => (
                      <div key={`${idx}`} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={p.key}
                          placeholder="e.g. username"
                          onChange={(e) => {
                            const v = e.target.value;
                            setCredPairs((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, key: v } : x))
                            );
                          }}
                          className="w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface"
                        />
                        <input
                          type="text"
                          value={p.value}
                          placeholder="e.g. john_123"
                          onChange={(e) => {
                            const v = e.target.value;
                            setCredPairs((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, value: v } : x))
                            );
                          }}
                          className="w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCredPairs((prev) => [...prev, { key: "", value: "" }])}
                      className="rounded-lg bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                      + Add field
                    </button>
                    {credPairs.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCredPairs((prev) => prev.slice(0, -1))}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                      >
                        Remove last
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => void submitCredentials()}
                    disabled={credSaving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dim disabled:opacity-60"
                  >
                    {credSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                    Save credentials
                  </button>
                  <p className="mt-2 text-[11px] text-on-surface-variant">
                    Saving will mark the order’s credentials as ready and notify the customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

      <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <h4 className="text-xl font-bold">Product Distribution</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600/10 text-sm font-bold text-red-600">
                NX
              </div>
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-bold">Netflix</span>
                  <span>45%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full w-[45%] bg-red-600" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-500">
                D+
              </div>
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-bold">Disney+</span>
                  <span>28%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full w-[28%] bg-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-6 text-on-primary shadow-xl shadow-primary/30">
          <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="z-10">
            <Sparkles className="mb-4 size-10 stroke-[1.5]" aria-hidden />
            <h4 className="mb-2 text-xl font-bold">Automated Fulfillment</h4>
            <p className="text-sm leading-relaxed text-on-primary/80">
              System is currently running at 98.4% automation rate for premium account deliveries.
            </p>
          </div>
          <button
            type="button"
            className="z-10 mt-8 w-full rounded-xl bg-white py-3 font-bold text-sm text-primary transition-colors hover:bg-on-primary active:scale-[0.98]"
          >
            Optimizer Settings
          </button>
        </div>
      </div>
    </div>
  );
}
