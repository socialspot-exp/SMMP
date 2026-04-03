"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Plug,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PanelApiListItem = {
  id: string;
  label: string;
  api_url: string;
  api_key_masked: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type BalanceUiState =
  | { loading: true }
  | { loading: false; ok: true; balance?: string; currency?: string; raw: unknown }
  | { loading: false; ok: false; error: string; raw?: unknown };

export function AdminPanelApisView({ className }: { className?: string }) {
  const [panels, setPanels] = useState<PanelApiListItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<PanelApiListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [fLabel, setFLabel] = useState("");
  const [fUrl, setFUrl] = useState("");
  const [fKey, setFKey] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fActive, setFActive] = useState(true);
  const [balanceByPanel, setBalanceByPanel] = useState<Record<string, BalanceUiState>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/panel-apis", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(typeof data.error === "string" ? data.error : res.statusText);
        setPanels([]);
        return;
      }
      setPanels(Array.isArray(data.panels) ? data.panels : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load failed");
      setPanels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setFLabel("");
    setFUrl("https://");
    setFKey("");
    setFNotes("");
    setFActive(true);
    setFormError(null);
    setDrawer("add");
  }

  function openEdit(p: PanelApiListItem) {
    setEditing(p);
    setFLabel(p.label);
    setFUrl(p.api_url);
    setFKey("");
    setFNotes(p.notes ?? "");
    setFActive(p.is_active);
    setFormError(null);
    setDrawer("edit");
  }

  function closeDrawer() {
    setDrawer(null);
    setEditing(null);
    setFormError(null);
  }

  async function submitForm() {
    setFormError(null);
    setSaving(true);
    try {
      if (drawer === "add") {
        const res = await fetch("/api/admin/panel-apis", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: fLabel.trim(),
            api_url: fUrl.trim(),
            api_key: fKey.trim(),
            notes: fNotes.trim() || null,
            is_active: fActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(typeof data.error === "string" ? data.error : "Save failed");
          return;
        }
      } else if (drawer === "edit" && editing) {
        const body: Record<string, unknown> = {
          id: editing.id,
          label: fLabel.trim(),
          api_url: fUrl.trim(),
          notes: fNotes.trim() || null,
          is_active: fActive,
        };
        if (fKey.trim()) body.api_key = fKey.trim();
        const res = await fetch("/api/admin/panel-apis", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(typeof data.error === "string" ? data.error : "Update failed");
          return;
        }
      }
      closeDrawer();
      void load();
    } finally {
      setSaving(false);
    }
  }

  async function deletePanel(id: string) {
    if (!confirm("Remove this panel connection?")) return;
    const res = await fetch(`/api/admin/panel-apis?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json();
      setLoadError(typeof data.error === "string" ? data.error : "Delete failed");
      return;
    }
    setBalanceByPanel((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    void load();
  }

  async function checkBalance(panelId: string) {
    setBalanceByPanel((prev) => ({ ...prev, [panelId]: { loading: true } }));
    try {
      const res = await fetch("/api/admin/panel-apis/balance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: panelId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        panelResponse?: unknown;
      };

      if (!res.ok || data.ok === false) {
        setBalanceByPanel((prev) => ({
          ...prev,
          [panelId]: {
            loading: false,
            ok: false,
            error: typeof data.error === "string" ? data.error : "Balance check failed",
            raw: data.panelResponse,
          },
        }));
        return;
      }

      const pr = data.panelResponse;
      if (pr && typeof pr === "object" && pr !== null && "balance" in pr) {
        const o = pr as { balance: unknown; currency?: unknown };
        setBalanceByPanel((prev) => ({
          ...prev,
          [panelId]: {
            loading: false,
            ok: true,
            balance: String(o.balance),
            currency: o.currency != null ? String(o.currency) : undefined,
            raw: pr,
          },
        }));
      } else {
        setBalanceByPanel((prev) => ({
          ...prev,
          [panelId]: { loading: false, ok: true, raw: pr },
        }));
      }
    } catch (e) {
      setBalanceByPanel((prev) => ({
        ...prev,
        [panelId]: {
          loading: false,
          ok: false,
          error: e instanceof Error ? e.message : "Request failed",
        },
      }));
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface";

  return (
    <div className={cn("relative mx-auto w-full max-w-4xl space-y-8 p-4 md:p-8", className)}>
      {drawer ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-md flex-col border-l border-outline-variant/15 bg-surface-container-lowest shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-4">
              <div className="flex items-center gap-2">
                <Plug className="size-5 text-primary" aria-hidden />
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  {drawer === "add" ? "Add panel API" : "Edit panel API"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {formError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {formError}
                </p>
              ) : null}
              <div>
                <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                  Panel name
                </label>
                <input
                  value={fLabel}
                  onChange={(e) => setFLabel(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Main reseller"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                  API URL
                </label>
                <input
                  value={fUrl}
                  onChange={(e) => setFUrl(e.target.value)}
                  className={cn(fieldClass, "font-mono text-xs")}
                  placeholder="https://your-panel.com/api/v2"
                />
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  Use the panel base URL (usually ends in <code className="font-mono">/api/v2</code>).
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                  API key
                </label>
                <input
                  value={fKey}
                  onChange={(e) => setFKey(e.target.value)}
                  type="password"
                  autoComplete="off"
                  className={cn(fieldClass, "font-mono text-xs")}
                  placeholder={drawer === "edit" ? "Leave blank to keep current key" : "Your panel API key"}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">
                  Notes (optional)
                </label>
                <textarea
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  rows={3}
                  className={fieldClass}
                  placeholder="Internal note — not sent to the panel."
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                <input
                  type="checkbox"
                  checked={fActive}
                  onChange={(e) => setFActive(e.target.checked)}
                  className="size-4 rounded border-outline-variant"
                />
                Active (use for new SMM order routing when wired)
              </label>
            </div>
            <div className="flex gap-2 border-t border-outline-variant/10 p-4">
              <button
                type="button"
                onClick={() => void submitForm()}
                disabled={saving || !fLabel.trim() || !fUrl.trim() || (drawer === "add" && !fKey.trim())}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
              >
                {saving ? "Saving…" : drawer === "add" ? "Add panel" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-xl border border-outline-variant/25 px-5 py-2.5 text-sm font-bold text-on-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="size-5 stroke-[1.75]" aria-hidden />
          Add panel API
        </button>
      </div>

      {loadError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
          {loadError.includes("smm_panel_apis") || loadError.includes("does not exist") ? (
            <>
              {" "}
              Run Supabase migration <code className="font-mono text-xs">008_smm_panel_apis.sql</code>.
            </>
          ) : null}
        </p>
      ) : null}

      {loading && panels.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Loading panels…</p>
      ) : null}

      {!loading && panels.length === 0 && !loadError ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low/30 px-8 py-16 text-center">
          <Plug className="mx-auto mb-4 size-12 text-on-surface-variant/40" aria-hidden />
          <p className="font-headline text-lg font-bold text-on-surface">No panels yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">
            Add your reseller API URL and key. We’ll use it to place and track SMM orders (services, add,
            status, etc.).
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            Add panel API
          </button>
        </div>
      ) : null}

      {panels.length > 0 ? (
        <ul className="space-y-4">
          {panels.map((p) => {
            const bal = balanceByPanel[p.id];
            return (
              <li
                key={p.id}
                className={cn(
                  "rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm",
                  !p.is_active && "opacity-60"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-headline text-lg font-bold text-on-surface">{p.label}</p>
                    <p className="mt-1 truncate font-mono text-xs text-on-surface-variant" title={p.api_url}>
                      {p.api_url}
                    </p>
                    <p className="mt-2 font-mono text-xs text-on-surface-variant">
                      Key: <span className="text-on-surface">{p.api_key_masked}</span>
                    </p>
                    {p.notes ? (
                      <p className="mt-2 text-xs text-on-surface-variant">{p.notes}</p>
                    ) : null}
                    {bal && !bal.loading ? (
                      <div className="mt-3 rounded-lg border border-outline-variant/15 bg-surface-container-low/50 px-3 py-2 text-xs">
                        {bal.ok === false ? (
                          <>
                            <p className="font-medium text-red-700">{bal.error}</p>
                            {bal.raw != null ? (
                              <pre className="mt-2 max-h-20 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-on-surface-variant">
                                {JSON.stringify(bal.raw, null, 2)}
                              </pre>
                            ) : null}
                          </>
                        ) : (
                          <>
                            {bal.balance != null ? (
                              <p className="font-headline font-bold text-on-surface">
                                Balance:{" "}
                                <span className="text-primary">{bal.balance}</span>
                                {bal.currency ? (
                                  <span className="ml-1 font-mono text-on-surface-variant">{bal.currency}</span>
                                ) : null}
                              </p>
                            ) : (
                              <pre className="max-h-24 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-on-surface-variant">
                                {JSON.stringify(bal.raw, null, 2)}
                              </pre>
                            )}
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void checkBalance(p.id)}
                      disabled={bal?.loading === true}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/15 disabled:opacity-50"
                    >
                      {bal?.loading === true ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Wallet className="size-3.5" aria-hidden />
                      )}
                      Check balance
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/25 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-low"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void deletePanel(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
