"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Loader2,
  MoreVertical,
  PlayCircle,
  Plus,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SmmStatus = "processing" | "completed" | "canceled" | "partial" | "refunded";

type SmmOrderRow = {
  key: string;
  displayId: string;
  customer: string;
  initials: string;
  initialsClass: string;
  service: string;
  serviceIcon: "camera" | "play" | "users" | "heart";
  servicePillClass: string;
  targetHref: string;
  targetLabel: string;
  qty: string;
  status: SmmStatus;
  statusLabel: string;
  apiStatusPayload: Record<string, unknown>;
  date: string;
};

type FilterKey = "all" | SmmStatus;

function ServiceIcon({ kind }: { kind: SmmOrderRow["serviceIcon"] }) {
  const cls = "size-4 shrink-0 stroke-[1.75]";
  if (kind === "camera") return <Camera className={cls} aria-hidden />;
  if (kind === "play") return <PlayCircle className={cls} aria-hidden />;
  if (kind === "users") return <UserPlus className={cls} aria-hidden />;
  return <Heart className={cls} aria-hidden />;
}

function StatusPill({ status }: { status: SmmStatus }) {
  if (status === "refunded") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-violet-700 uppercase">
        Refunded
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-amber-700 uppercase">
        Partial
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-blue-600 uppercase">
        Processing
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-green-600 uppercase">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-red-600 uppercase">
      Canceled
    </span>
  );
}

export function AdminSmmOrdersView({ className }: { className?: string }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [rows, setRows] = useState<SmmOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionRowId, setActionRowId] = useState<string | null>(null);
  const [detailsRow, setDetailsRow] = useState<SmmOrderRow | null>(null);
  const [statusRow, setStatusRow] = useState<SmmOrderRow | null>(null);
  const [statusDraft, setStatusDraft] = useState("Processing");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/smm-orders", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setRows([]);
        setLoadError(typeof data?.error === "string" ? data.error : res.statusText);
        return;
      }
      const raw = Array.isArray(data?.orders) ? data.orders : [];
      setRows(
        raw.map((r: any): SmmOrderRow => {
          const statusRaw = String(r.status ?? "").toLowerCase();
          const status: SmmStatus = statusRaw.includes("refund")
            ? "refunded"
            : statusRaw.includes("partial")
              ? "partial"
              : statusRaw.includes("complete")
                ? "completed"
                : statusRaw.includes("cancel")
                  ? "canceled"
                  : "processing";
          const p = String(r.platform ?? "").toLowerCase();
          const serviceIcon: SmmOrderRow["serviceIcon"] =
            p.includes("youtube")
              ? "play"
              : p.includes("tiktok")
                ? "users"
                : p.includes("twitter") || p.includes("x")
                  ? "heart"
                  : "camera";
          const servicePillClass =
            serviceIcon === "play"
              ? "bg-blue-50 text-blue-700"
              : serviceIcon === "users"
                ? "bg-teal-50 text-teal-700"
                : serviceIcon === "heart"
                  ? "bg-sky-50 text-sky-700"
                  : "bg-pink-50 text-pink-700";
          const customerRaw = String(r.customerEmail ?? "Guest");
          const initials = customerRaw
            .split("@")[0]
            .split(/[.\s_-]+/)
            .filter(Boolean)
            .map((s: string) => s[0]!.toUpperCase())
            .slice(0, 2)
            .join("") || "GU";
          const userHint =
            r.customerUserNo != null
              ? `#${r.customerUserNo}${r.customerUsername ? ` · @${r.customerUsername}` : ""}`
              : "";
          return {
            key: String(r.id),
            displayId: `${String(r.orderRef)}${r.apiOrderId ? ` · API:${String(r.apiOrderId)}` : ""}`,
            customer: `${customerRaw}${userHint ? ` (${userHint})` : ""}`,
            initials,
            initialsClass: "bg-blue-100 text-blue-600",
            service: String(r.productName),
            serviceIcon,
            servicePillClass,
            targetHref: String(r.targetUrl),
            targetLabel: String(r.targetUrl),
            qty: Number(r.quantity ?? 1).toLocaleString("en-US"),
            status,
            statusLabel: String(r.status ?? "Processing"),
            apiStatusPayload:
              r.apiStatusPayload && typeof r.apiStatusPayload === "object"
                ? (r.apiStatusPayload as Record<string, unknown>)
                : {},
            date: new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(String(r.createdAt))),
          };
        })
      );
    } catch (e) {
      setRows([]);
      setLoadError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function callAction(payload: Record<string, unknown>) {
    setActionError(null);
    const rowId = typeof payload.orderId === "string" ? payload.orderId : null;
    setActionBusy(rowId);
    try {
      const res = await fetch("/api/admin/smm-orders/actions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Action failed");
      await loadOrders();
      return data;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
      return null;
    } finally {
      setActionBusy(null);
    }
  }

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((o) => o.status === filter);
  }, [filter, rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const processing = rows.filter((r) => r.status === "processing").length;
    const completed = rows.filter((r) => r.status === "completed").length;
    // revenue not in current UI payload; keep display stable by counting completed qty as proxy impossible.
    // So compute from parsed qty/service not possible reliably; keep as count-based placeholder with real row count.
    return {
      total,
      processing,
      completed,
      revenue: "—",
    };
  }, [rows]);

  const filterBtn = (key: FilterKey, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(key)}
      className={cn(
        "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
        filter === key
          ? "bg-primary text-on-primary"
          : "bg-surface text-on-surface-variant hover:bg-surface-container"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8", className)}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Service Orders
          </h2>
          <p className="font-medium text-on-surface-variant">
            Manage and track all customer SMM service requests.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-container active:scale-[0.98]"
          >
            <Download className="size-5 stroke-[1.75]" aria-hidden />
            Export CSV
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-[0.98]"
          >
            <Plus className="size-5 stroke-[1.75]" aria-hidden />
            New Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {(
          [
            { label: "Total Orders", value: stats.total.toLocaleString(), valueClass: "text-on-surface" },
            { label: "Processing", value: stats.processing.toLocaleString(), valueClass: "text-primary" },
            { label: "Completed", value: stats.completed.toLocaleString(), valueClass: "text-green-600" },
            { label: "Revenue", value: stats.revenue, valueClass: "text-on-surface" },
          ] as const
        ).map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5"
          >
            <p className="mb-1 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
              {s.label}
            </p>
            <p className={cn("font-headline text-2xl font-extrabold", s.valueClass)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-xl shadow-on-surface/5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/10 bg-surface-container-low/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterBtn("all", "All Statuses")}
            {filterBtn("processing", "Processing")}
            {filterBtn("completed", "Completed")}
            {filterBtn("canceled", "Canceled")}
          </div>
          <span className="text-xs font-medium text-on-surface-variant">
            Showing {filtered.length} of {stats.total.toLocaleString()} results
          </span>
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
                  Service
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Target Link
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Qty
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    Loading orders...
                  </td>
                </tr>
              ) : null}
              {!loading && loadError ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8">
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                      {loadError}
                    </p>
                  </td>
                </tr>
              ) : null}
              {!loading && !loadError && filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-on-surface-variant">
                    No SMM orders found.
                  </td>
                </tr>
              ) : null}
              {filtered.map((o) => (
                <tr key={o.key} className="group transition-colors hover:bg-surface">
                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{o.displayId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          o.initialsClass
                        )}
                      >
                        {o.initials}
                      </div>
                      <span className="text-sm font-semibold text-on-surface">{o.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                        o.servicePillClass
                      )}
                    >
                      <ServiceIcon kind={o.serviceIcon} />
                      {o.service}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={o.targetHref}
                      className="block max-w-[150px] truncate text-xs font-medium text-primary hover:underline"
                    >
                      {o.targetLabel}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">{o.qty}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{o.date}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActionRowId((prev) => (prev === o.key ? null : o.key))}
                        className="p-2 text-on-surface-variant opacity-0 transition-all group-hover:opacity-100 hover:text-primary"
                        aria-label="Row actions"
                      >
                        {actionBusy === o.key ? (
                          <Loader2 className="size-5 animate-spin" aria-hidden />
                        ) : (
                          <MoreVertical className="size-5 stroke-[1.75]" aria-hidden />
                        )}
                      </button>
                      {actionRowId === o.key ? (
                        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-1 shadow-xl">
                          <button
                            type="button"
                            className="w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-low"
                            onClick={async () => {
                              setActionRowId(null);
                              await callAction({ action: "refresh_status", orderId: o.key });
                            }}
                          >
                            Refresh Status
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-50"
                            disabled={o.status === "refunded"}
                            onClick={() => {
                              setActionRowId(null);
                              setStatusRow(o);
                              setStatusDraft(o.statusLabel || "Processing");
                            }}
                          >
                            Change Status
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-low"
                            onClick={() => {
                              setActionRowId(null);
                              setDetailsRow(o);
                            }}
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            disabled={o.status === "refunded"}
                            onClick={async () => {
                              setActionRowId(null);
                              if (!confirm(`Cancel and refund ${o.displayId}?`)) return;
                              await callAction({ action: "cancel_refund", orderId: o.key });
                            }}
                          >
                            Cancel & Refund
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/10 bg-surface-container-low/20 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border border-outline-variant/20 bg-surface p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-50"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4 stroke-[1.75]" aria-hidden />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-on-primary"
              >
                1
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
              >
                2
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
              >
                3
              </button>
              <span className="mx-1 text-on-surface-variant">...</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
              >
                128
              </button>
            </div>
            <button
              type="button"
              className="rounded-lg border border-outline-variant/20 bg-surface p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
              aria-label="Next"
            >
              <ChevronRight className="size-4 stroke-[1.75]" aria-hidden />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-on-surface-variant">Rows per page</label>
            <select className="rounded-lg border border-outline-variant/20 bg-surface px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary-dim p-8 shadow-xl shadow-primary/20 lg:col-span-2">
          <div className="relative z-10">
            <h3 className="mb-2 text-xl font-bold text-on-primary">Platform Performance</h3>
            <p className="mb-6 max-w-sm text-sm text-on-primary/80">
              Instagram services are seeing a 14% increase in demand this week. Consider adjusting stock
              levels for bulk orders.
            </p>
            <button
              type="button"
              className="rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-primary shadow-lg transition-all active:scale-95 hover:bg-on-primary"
            >
              View Analytics
            </button>
          </div>
          <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-all duration-700 group-hover:bg-white/20" />
          <TrendingUp
            className="pointer-events-none absolute top-8 right-8 size-36 text-on-primary/10 select-none stroke-[0.5]"
            aria-hidden
          />
        </div>
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-highest/40 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-on-surface">Recent Alerts</h3>
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <div>
                <p className="text-xs font-bold text-on-surface">API Connection Slow</p>
                <p className="text-[11px] text-on-surface-variant">
                  The main provider endpoint is responding with 2.4s latency.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <div>
                <p className="text-xs font-bold text-on-surface">3 Order Failures</p>
                <p className="text-[11px] text-on-surface-variant">
                  Payment verification failed for IDs #98221, #98222.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {actionError}
        </p>
      ) : null}
      {statusRow ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-5 shadow-2xl">
            <h3 className="font-headline text-lg font-bold text-on-surface">Change Order Status</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{statusRow.displayId}</p>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className="mt-4 w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm"
            >
              <option>Processing</option>
              <option>Completed</option>
              <option>Partial</option>
              <option>Cancelled</option>
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-outline-variant/20 px-3 py-2 text-sm font-semibold"
                onClick={() => setStatusRow(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary"
                onClick={async () => {
                  const row = statusRow;
                  setStatusRow(null);
                  await callAction({ action: "change_status", orderId: row.key, status: statusDraft });
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {detailsRow ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-surface-container-lowest p-5 shadow-2xl">
            <h3 className="font-headline text-lg font-bold text-on-surface">API Details</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{detailsRow.displayId}</p>
            <pre className="mt-4 max-h-[60vh] overflow-auto rounded-lg bg-surface p-3 text-xs text-on-surface">
              {JSON.stringify(detailsRow.apiStatusPayload ?? {}, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-lg border border-outline-variant/20 px-3 py-2 text-sm font-semibold"
                onClick={() => setDetailsRow(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
