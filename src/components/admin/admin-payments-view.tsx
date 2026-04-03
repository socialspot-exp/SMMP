"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Loader2, Power, Save } from "lucide-react";
import {
  CREDENTIAL_FIELDS,
  GATEWAY_ORDER,
  type GatewayKey,
} from "@/lib/payment-gateways";
import { cn } from "@/lib/utils";

type GatewayRow = {
  gateway_key: GatewayKey;
  display_name: string;
  is_enabled: boolean;
  credentials: Record<string, string | null>;
  webhook_secret_masked: string | null;
  webhook_url: string | null;
  fields: { key: string; label: string; placeholder?: string }[];
};

const fieldClass =
  "w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface";

export function AdminPaymentsView({ className }: { className?: string }) {
  const [rows, setRows] = useState<GatewayRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<GatewayKey | null>(null);

  const [drafts, setDrafts] = useState<
    Record<
      GatewayKey,
      {
        display_name: string;
        is_enabled: boolean;
        webhook_secret: string;
        webhook_url: string;
        credentials: Record<string, string>;
      }
    >
  >({} as any);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/payments/gateways", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(typeof data.error === "string" ? data.error : "Failed to load gateways");
        setRows([]);
        return;
      }
      const gateways = Array.isArray(data.gateways) ? (data.gateways as GatewayRow[]) : [];
      setRows(gateways);
      const next = {} as any;
      for (const r of gateways) {
        next[r.gateway_key] = {
          display_name: r.display_name ?? r.gateway_key,
          is_enabled: !!r.is_enabled,
          webhook_secret: "",
          webhook_url: r.webhook_url ?? "",
          credentials: Object.fromEntries(Object.keys(r.credentials ?? {}).map((k) => [k, ""])),
        };
      }
      setDrafts(next);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load gateways");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedRows = useMemo(() => {
    const map = new Map(rows.map((r) => [r.gateway_key, r] as const));
    return GATEWAY_ORDER.map((k) => map.get(k)).filter(Boolean) as GatewayRow[];
  }, [rows]);

  async function saveGateway(key: GatewayKey) {
    const d = drafts[key];
    if (!d) return;
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/payments/gateways", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway_key: key,
          display_name: d.display_name,
          is_enabled: d.is_enabled,
          webhook_secret: d.webhook_secret || undefined,
          webhook_url: d.webhook_url || null,
          credentials: d.credentials,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      await load();
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-2xl font-extrabold text-on-surface">Payments</h2>
          <p className="text-sm text-on-surface-variant">
            Manage payment gateways, credentials, and webhooks from one place.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
          {loadError}
          {(loadError.includes("payment_gateways") || loadError.includes("does not exist")) && (
            <p className="mt-2 text-xs">
              Run migration <code className="font-mono">017_payment_gateways.sql</code>.
            </p>
          )}
        </div>
      ) : null}

      {loading && rows.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading gateways…
        </div>
      ) : null}

      <div className="grid gap-4">
        {sortedRows.map((row) => {
          const key = row.gateway_key;
          const d = drafts[key];
          const fields = row.fields?.length ? row.fields : CREDENTIAL_FIELDS[key] ?? [];
          return (
            <section
              key={key}
              className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" aria-hidden />
                  <h3 className="font-headline text-lg font-bold text-on-surface">{row.display_name}</h3>
                  <span className="rounded-md bg-surface-container-low px-2 py-0.5 font-mono text-[10px] text-on-surface-variant uppercase">
                    {key}
                  </span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <input
                    type="checkbox"
                    checked={!!d?.is_enabled}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], is_enabled: e.target.checked },
                      }))
                    }
                    className="size-4 rounded border-outline-variant"
                  />
                  <Power className={cn("size-4", d?.is_enabled ? "text-green-600" : "text-on-surface-variant")} />
                  {d?.is_enabled ? "Enabled" : "Disabled"}
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Display Name</label>
                  <input
                    className={fieldClass}
                    value={d?.display_name ?? row.display_name}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], display_name: e.target.value },
                      }))
                    }
                    placeholder="Gateway label at checkout"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Webhook URL</label>
                  <input
                    className={cn(fieldClass, "font-mono text-xs")}
                    value={d?.webhook_url ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], webhook_url: e.target.value },
                      }))
                    }
                    placeholder={`/api/payments/webhook/${key}`}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                  Webhook secret
                </label>
                <input
                  className={cn(fieldClass, "font-mono text-xs")}
                  type="password"
                  value={d?.webhook_secret ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], webhook_secret: e.target.value },
                    }))
                  }
                  placeholder={row.webhook_secret_masked ?? "Set shared secret"}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                      {f.label}
                    </label>
                    <input
                      className={cn(fieldClass, "font-mono text-xs")}
                      value={d?.credentials?.[f.key] ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            credentials: { ...prev[key].credentials, [f.key]: e.target.value },
                          },
                        }))
                      }
                      placeholder={row.credentials?.[f.key] ?? f.placeholder ?? ""}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={savingKey === key}
                  onClick={() => void saveGateway(key)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {savingKey === key ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="size-4" aria-hidden />
                  )}
                  Save {row.display_name}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

