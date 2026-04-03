"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ListFilter,
  MoreVertical,
  Search,
  TrendingUp,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import type { AdminUserRow } from "@/lib/fetch-admin-users";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: AdminUserRow["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
        Active
      </span>
    );
  }
  if (status === "new") {
    return (
      <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
        New
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
        Locked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-error-container px-2.5 py-0.5 text-xs font-bold text-on-error-container">
      Banned
    </span>
  );
}

function escapeCsvCell(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function toCsv(rows: AdminUserRow[]): string {
  const header = [
    "clerk_id",
    "user_no",
    "name",
    "email",
    "username",
    "registered",
    "status",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.userNo ?? "",
        r.name,
        r.email,
        r.username ?? "",
        r.registeredLabel,
        r.status,
      ].map((c) => escapeCsvCell(String(c))).join(",")
    ),
  ];
  return lines.join("\n");
}

type AdminUsersViewProps = {
  users: AdminUserRow[];
  totalCount: number;
  fetchError: string | null;
  className?: string;
};

export function AdminUsersView({
  users,
  totalCount,
  fetchError,
  className,
}: AdminUsersViewProps) {
  const [query, setQuery] = useState("");
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [
        u.id,
        u.userNo != null ? String(u.userNo) : "",
        u.name,
        u.email,
        u.username ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, query]);

  const verifiedCount = useMemo(
    () => users.filter((u) => u.status === "active").length,
    [users]
  );
  const pendingVerify = useMemo(
    () => users.filter((u) => u.status === "new").length,
    [users]
  );

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curator-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openEdit = (u: AdminUserRow) => {
    setOpenMenuFor(null);
    setEditUser(u);
    setEditBalance(u.walletBalance.toFixed(2));
    setEditReason("");
  };

  const closeEdit = () => {
    setEditUser(null);
    setEditBalance("");
    setEditReason("");
    setEditSaving(false);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    const newBalance = parseFloat(editBalance);
    if (isNaN(newBalance) || newBalance < 0) {
      alert("Invalid balance amount");
      return;
    }
    try {
      setEditSaving(true);
      const res = await fetch("/api/admin/users/update-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          balance: newBalance,
          reason: editReason.trim() ? editReason.trim() : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update balance");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update balance");
      setEditSaving(false);
    }
  };

  const suspendUser = async (u: AdminUserRow) => {
    setOpenMenuFor(null);
    if (!confirm(`Suspend ${u.email}? This will ban the user in Clerk.`)) return;
    try {
      const res = await fetch("/api/admin/users/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id }),
      });
      if (!res.ok) throw new Error("Failed to suspend user");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to suspend user");
    }
  };

  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8", className)}>
      {fetchError ? (
        <div
          className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container"
          role="alert"
        >
          <strong className="font-semibold">Could not load users.</strong> {fetchError}
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            User Management
          </h2>
          <p className="mt-1 font-medium text-on-surface-variant">
            Manage and monitor{" "}
            <span className="font-bold text-primary">{totalCount.toLocaleString()}</span>{" "}
            registered platform curators
            {totalCount > users.length ? (
              <span className="text-on-surface-variant">
                {" "}
                (showing latest {users.length})
              </span>
            ) : null}
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-container-low active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            <Download className="size-5 stroke-[1.75]" aria-hidden />
            Export CSV
          </button>
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-[0.98]"
          >
            <UserPlus className="size-5 stroke-[1.75]" aria-hidden />
            Add in Clerk
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex min-w-[min(100%,300px)] flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-on-surface-variant stroke-[1.75]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, email, or ID..."
              className="w-full rounded-lg border-none bg-surface py-2 pr-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:ring-1 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center rounded-lg border border-outline-variant/10 bg-surface px-3 py-1.5 transition-colors hover:bg-surface-container-low"
          >
            <ListFilter className="mr-2 size-5 text-on-surface-variant stroke-[1.75]" aria-hidden />
            <span className="text-xs font-semibold text-on-surface-variant">All Statuses</span>
            <ChevronDown className="ml-1 size-5 text-on-surface-variant stroke-[1.75]" aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-on-surface-variant">Sort by:</span>
          <span className="text-xs font-bold text-on-surface">Recently registered</span>
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
                  Registration Date
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Total Orders
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Wallet Balance
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-on-surface-variant"
                  >
                    {users.length === 0
                      ? "No users found in this Clerk instance."
                      : "No users match your filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className={cn(
                      "group transition-colors hover:bg-surface",
                      u.status === "banned" && "opacity-80"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white shadow-sm",
                            u.avatarRingClass,
                            u.status === "banned" && "grayscale"
                          )}
                        >
                          {u.imageUrl ? (
                            <Image
                              src={u.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <span className="text-sm font-bold text-on-surface-variant">
                              {u.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-on-surface">{u.name}</div>
                          <div className="text-xs text-on-surface-variant">{u.email}</div>
                          {(u.userNo != null || u.username) && (
                            <div className="text-[11px] text-on-surface-variant/80">
                              {u.userNo != null && <span>#{u.userNo}</span>}
                              {u.userNo != null && u.username && " · "}
                              {u.username && <span>@{u.username}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      {u.registeredLabel}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {u.ordersDisplay}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{u.spentDisplay}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1">
                        <Wallet className="size-4 stroke-2 text-on-surface-variant" aria-hidden />
                        <span className="text-sm font-bold text-on-surface">
                          ${u.walletBalance.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={() => setOpenMenuFor((v) => (v === u.id ? null : u.id))}
                          className="inline-flex rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                          aria-label="User actions"
                        >
                          <MoreVertical className="size-5 stroke-[1.75]" aria-hidden />
                        </button>
                        {openMenuFor === u.id ? (
                          <div className="absolute right-0 z-50 mt-10 w-48 overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-lg">
                            <button
                              type="button"
                              onClick={() => openEdit(u)}
                              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
                            >
                              Edit user
                            </button>
                            <button
                              type="button"
                              onClick={() => suspendUser(u)}
                              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-error transition-colors hover:bg-surface-container"
                            >
                              Suspend user
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/10 bg-surface-container-low/30 px-6 py-4">
          <div className="text-xs font-medium text-on-surface-variant">
            <span className="font-bold text-on-surface">{filtered.length}</span>
            {query.trim() ? (
              <> matching filter</>
            ) : null}
            {" · "}
            {users.length} loaded · {totalCount.toLocaleString()} total in Clerk
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-5 stroke-[1.75]" aria-hidden />
            </button>
            <span className="px-2 text-xs text-on-surface-variant">Page 1</span>
            <button
              type="button"
              disabled={totalCount <= users.length}
              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="size-5 stroke-[1.75]" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-xl shadow-primary/20">
          <TrendingUp
            className="pointer-events-none absolute -right-4 -bottom-4 size-36 stroke-[0.5] text-white/10"
            aria-hidden
          />
          <div className="text-xs font-bold tracking-widest uppercase opacity-80">Total loaded</div>
          <div className="font-headline text-3xl font-extrabold">{users.length}</div>
          <div className="self-start rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
            This page batch
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            Active (verified)
          </div>
          <div className="font-headline text-3xl font-extrabold text-on-surface">
            {verifiedCount.toLocaleString()}
          </div>
          <div className="flex items-center text-[10px] font-bold text-green-600">
            <ArrowUp className="mr-1 size-4 stroke-2" aria-hidden />
            In loaded set
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            New / unverified
          </div>
          <div className="font-headline text-3xl font-extrabold text-on-surface">
            {pendingVerify.toLocaleString()}
          </div>
          <div className="flex items-center text-[10px] font-bold text-secondary">
            <Clock className="mr-1 size-4 stroke-2" aria-hidden />
            In loaded set
          </div>
        </div>
      </div>

      {editUser ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-outline-variant/10 px-6 py-5">
              <div>
                <h3 className="text-lg font-extrabold text-on-surface">Edit user</h3>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {editUser.email} {editUser.userNo != null ? `· #${editUser.userNo}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
                aria-label="Close"
              >
                <X className="size-5 stroke-[1.75]" aria-hidden />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  Wallet balance (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm font-semibold text-on-surface focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  Reason (shows in transactions)
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Manual adjustment"
                  className="mt-2 w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-outline-variant/10 px-6 py-5">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl border border-outline-variant/20 bg-surface px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dim disabled:pointer-events-none disabled:opacity-50"
                disabled={editSaving}
              >
                {editSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
