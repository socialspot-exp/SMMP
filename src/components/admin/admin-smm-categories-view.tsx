"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  ALL_SOCIAL_PLATFORM_IDS,
  type SocialPlatformId,
  SocialBrandIcon,
  isSocialPlatformId,
} from "@/components/home/social-brand";
import type { SmmPlatformDTO, SmmSubcategoryDTO } from "@/lib/smm-catalog-api";
import { cn } from "@/lib/utils";

export function AdminSmmCategoriesView({ className }: { className?: string }) {
  const [platforms, setPlatforms] = useState<SmmPlatformDTO[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newPlatLabel, setNewPlatLabel] = useState("");
  const [newPlatSlug, setNewPlatSlug] = useState("");
  const [newPlatIcon, setNewPlatIcon] = useState<SocialPlatformId>("instagram");

  const [subForms, setSubForms] = useState<Record<string, { label: string; slug: string }>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/smm-catalog", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? res.statusText);
        setPlatforms([]);
        return;
      }
      setPlatforms(data.platforms ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setSubForm = (platformId: string, field: "label" | "slug", value: string) => {
    setSubForms((prev) => {
      const cur = prev[platformId] ?? { label: "", slug: "" };
      return {
        ...prev,
        [platformId]: { ...cur, [field]: value },
      };
    });
  };

  const addPlatform = async () => {
    const res = await fetch("/api/admin/smm-catalog/platforms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newPlatLabel,
        slug: newPlatSlug.trim() || undefined,
        icon_key: newPlatIcon,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed to add platform");
      return;
    }
    setNewPlatLabel("");
    setNewPlatSlug("");
    await load();
  };

  const deletePlatform = async (id: string) => {
    if (!confirm("Delete this platform and all its subcategories? Product links may clear.")) return;
    const res = await fetch(`/api/admin/smm-catalog/platforms?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Delete failed");
      return;
    }
    await load();
  };

  const patchPlatform = async (
    id: string,
    patch: Partial<{ icon_key: string; label: string; is_active: boolean }>
  ) => {
    const res = await fetch("/api/admin/smm-catalog/platforms", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Update failed");
      return;
    }
    await load();
  };

  const addSubcategory = async (platformId: string) => {
    const f = subForms[platformId] ?? { label: "", slug: "" };
    if (!f.label.trim()) {
      alert("Subcategory label required");
      return;
    }
    const res = await fetch("/api/admin/smm-catalog/subcategories", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform_id: platformId,
        label: f.label.trim(),
        slug: f.slug.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed to add subcategory");
      return;
    }
    setSubForms((prev) => ({ ...prev, [platformId]: { label: "", slug: "" } }));
    await load();
  };

  const deleteSubcategory = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    const res = await fetch(`/api/admin/smm-catalog/subcategories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Delete failed");
      return;
    }
    await load();
  };

  const patchSubcategory = async (id: string, patch: { is_active?: boolean }) => {
    const res = await fetch("/api/admin/smm-catalog/subcategories", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Update failed");
      return;
    }
    await load();
  };

  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8", className)}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            SMM categories
          </h2>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-on-error-container">
          <p className="font-bold">Could not load catalog</p>
          <p className="mt-1 opacity-90">{loadError}</p>
          <p className="mt-2 text-xs text-on-surface-variant">
            Ensure migration <code className="font-mono">005_smm_platforms_subcategories.sql</code> ran and{" "}
            <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> is set for admin APIs.
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">Add platform</h3>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">Label</label>
            <input
              value={newPlatLabel}
              onChange={(e) => setNewPlatLabel(e.target.value)}
              placeholder="e.g. Instagram"
              className="w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div className="w-full lg:w-40">
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">Slug (opt.)</label>
            <input
              value={newPlatSlug}
              onChange={(e) => setNewPlatSlug(e.target.value)}
              placeholder="auto from label"
              className="w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 font-mono text-sm"
            />
          </div>
          <div className="w-full lg:w-56">
            <label className="mb-1 block text-xs font-bold text-on-surface-variant uppercase">Social icon</label>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface">
                <SocialBrandIcon id={newPlatIcon} className="size-5" />
              </div>
              <select
                value={newPlatIcon}
                onChange={(e) => setNewPlatIcon(e.target.value as SocialPlatformId)}
                className="min-w-0 flex-1 rounded-lg border border-outline-variant/25 bg-surface px-2 py-2 text-xs font-semibold"
              >
                {ALL_SOCIAL_PLATFORM_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void addPlatform()}
            disabled={loading || !newPlatLabel.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            Add platform
          </button>
        </div>
      </div>

      {loading && platforms.length === 0 && !loadError ? (
        <p className="text-sm text-on-surface-variant">Loading catalog…</p>
      ) : null}

      <div className="space-y-6">
        {platforms.map((p) => (
          <PlatformCard
            key={p.id}
            platform={p}
            subForm={subForms[p.id] ?? { label: "", slug: "" }}
            onSubFormChange={(field, v) => setSubForm(p.id, field, v)}
            onDeletePlatform={() => void deletePlatform(p.id)}
            onPatchPlatform={(patch) => void patchPlatform(p.id, patch)}
            onAddSubcategory={() => void addSubcategory(p.id)}
            onDeleteSubcategory={(sid) => void deleteSubcategory(sid)}
            onPatchSubcategory={(sid, patch) => void patchSubcategory(sid, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function PlatformCard({
  platform: p,
  subForm,
  onSubFormChange,
  onDeletePlatform,
  onPatchPlatform,
  onAddSubcategory,
  onDeleteSubcategory,
  onPatchSubcategory,
}: {
  platform: SmmPlatformDTO;
  subForm: { label: string; slug: string };
  onSubFormChange: (field: "label" | "slug", value: string) => void;
  onDeletePlatform: () => void;
  onPatchPlatform: (patch: Partial<{ icon_key: string; label: string; is_active: boolean }>) => void;
  onAddSubcategory: () => void;
  onDeleteSubcategory: (id: string) => void;
  onPatchSubcategory: (id: string, patch: { is_active?: boolean }) => void;
}) {
  const iconKey: SocialPlatformId = isSocialPlatformId(p.icon_key) ? p.icon_key : "instagram";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm",
        !p.is_active && "opacity-70"
      )}
    >
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 bg-surface-container-low/40 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface">
            <SocialBrandIcon id={iconKey} className="size-7" />
          </div>
          <div className="min-w-0">
            <p className="font-headline text-lg font-bold text-on-surface">{p.label}</p>
            <p className="font-mono text-xs text-on-surface-variant">{p.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase">Icon</label>
            <select
              value={p.icon_key}
              onChange={(e) => onPatchPlatform({ icon_key: e.target.value })}
              className="rounded-lg border border-outline-variant/25 bg-surface px-2 py-1.5 text-xs font-semibold"
            >
              {ALL_SOCIAL_PLATFORM_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => onPatchPlatform({ is_active: !p.is_active })}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold",
              p.is_active ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
            )}
          >
            {p.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={onDeletePlatform}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
            aria-label="Delete platform"
          >
            <Trash2 className="size-4 stroke-[1.75]" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <h4 className="mb-3 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
          Subcategories
        </h4>
        <div className="mb-4 overflow-x-auto rounded-lg border border-outline-variant/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low/50 text-xs font-bold text-on-surface-variant uppercase">
                <th className="px-4 py-2">Label</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {p.subcategories.map((s: SmmSubcategoryDTO) => (
                <tr key={s.id} className={cn(!s.is_active && "opacity-60")}>
                  <td className="px-4 py-2 font-medium text-on-surface">{s.label}</td>
                  <td className="px-4 py-2 font-mono text-xs text-on-surface-variant">{s.slug}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => onPatchSubcategory(s.id, { is_active: !s.is_active })}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {s.is_active ? "active" : "inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteSubcategory(s.id)}
                      className="rounded p-1 text-on-surface-variant hover:bg-error/10 hover:text-error"
                      aria-label="Delete subcategory"
                    >
                      <Trash2 className="size-4 stroke-[1.75]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-bold text-on-surface-variant">New subcategory label</label>
            <input
              value={subForm.label}
              onChange={(e) => onSubFormChange("label", e.target.value)}
              placeholder="e.g. Followers"
              className="w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:w-44">
            <label className="mb-1 block text-xs font-bold text-on-surface-variant">Slug (opt.)</label>
            <input
              value={subForm.slug}
              onChange={(e) => onSubFormChange("slug", e.target.value)}
              placeholder="followers"
              className="w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 font-mono text-sm"
            />
          </div>
          <button
            type="button"
            onClick={onAddSubcategory}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/15"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            Add subcategory
          </button>
        </div>
      </div>
    </div>
  );
}
