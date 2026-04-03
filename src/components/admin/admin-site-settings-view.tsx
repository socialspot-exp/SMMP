"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe, ImageIcon, Loader2, Save, Search, Upload } from "lucide-react";
import type { SiteSettingsRow } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/30 focus:outline-none";

export function AdminSiteSettingsView({ className }: { className?: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<Partial<SiteSettingsRow>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-settings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to load");
        return;
      }
      if (data.settings) setForm(data.settings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set =
    (key: keyof SiteSettingsRow) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setSaved(false);
    };

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_title: form.site_title,
          site_tagline: form.site_tagline,
          meta_description: form.meta_description,
          meta_keywords: form.meta_keywords,
          og_title: form.og_title,
          og_description: form.og_description,
          og_image_url: form.og_image_url,
          twitter_site: form.twitter_site,
          logo_url: form.logo_url,
          favicon_url: form.favicon_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      if (data.settings) setForm(data.settings);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAsset(kind: "logo" | "favicon", file: File) {
    if (kind === "logo") setUploadingLogo(true);
    else setUploadingFavicon(true);
    setError(null);
    setSaved(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/site-settings/upload?kind=${kind}`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Upload failed");
        return;
      }
      if (data.settings) {
        setForm(data.settings);
        setSaved(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (kind === "logo") setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-16", className)}>
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-8 p-4 md:p-8", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Site settings
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Branding, SEO, and social preview — stored in Supabase <code className="font-mono text-xs">site_settings</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          Save changes
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
          {error}
          {error.includes("site_settings") || error.includes("does not exist") ? (
            <p className="mt-2 text-xs">
              Run migration <code className="font-mono">015_site_settings.sql</code> in Supabase.
            </p>
          ) : null}
        </div>
      ) : null}

      {saved ? (
        <p className="text-sm font-semibold text-green-700">Saved. Refresh the storefront to see metadata; logo updates on navigation.</p>
      ) : null}

      <section className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
          <ImageIcon className="size-5 text-primary" aria-hidden />
          Branding
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Site title</label>
            <input className={field} value={form.site_title ?? ""} onChange={set("site_title")} placeholder="Curator Market" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Tagline (optional)</label>
            <input className={field} value={form.site_tagline ?? ""} onChange={set("site_tagline")} placeholder="Short subtitle" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Logo URL (HTTPS)</label>
            <input className={cn(field, "font-mono text-xs")} value={form.logo_url ?? ""} onChange={set("logo_url")} placeholder="https://…" />
            <div className="mt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-low">
                {uploadingLogo ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Upload className="size-4" aria-hidden />
                )}
                Upload logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  disabled={uploadingLogo}
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) void uploadAsset("logo", file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            {form.logo_url?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.logo_url.trim()}
                alt=""
                className="mt-2 h-10 w-auto max-w-xs object-contain object-left"
              />
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Favicon URL (HTTPS, .ico or .png)</label>
            <input className={cn(field, "font-mono text-xs")} value={form.favicon_url ?? ""} onChange={set("favicon_url")} placeholder="https://…/favicon.ico" />
            <div className="mt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-low">
                {uploadingFavicon ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Upload className="size-4" aria-hidden />
                )}
                Upload favicon
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico"
                  className="hidden"
                  disabled={uploadingFavicon}
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) void uploadAsset("favicon", file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
          <Search className="size-5 text-primary" aria-hidden />
          SEO
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Meta description</label>
            <textarea
              className={cn(field, "min-h-[88px] resize-y")}
              value={form.meta_description ?? ""}
              onChange={set("meta_description")}
              placeholder="Shown in Google snippets and default OG description"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Meta keywords (comma-separated)</label>
            <input className={field} value={form.meta_keywords ?? ""} onChange={set("meta_keywords")} placeholder="smm, followers, premium accounts" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
          <Globe className="size-5 text-primary" aria-hidden />
          Open Graph &amp; Twitter
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">OG title (optional)</label>
            <input className={field} value={form.og_title ?? ""} onChange={set("og_title")} placeholder="Defaults to site title" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">OG description (optional)</label>
            <textarea
              className={cn(field, "min-h-[72px] resize-y")}
              value={form.og_description ?? ""}
              onChange={set("og_description")}
              placeholder="Defaults to meta description"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">OG image URL (1200×630 recommended)</label>
            <input className={cn(field, "font-mono text-xs")} value={form.og_image_url ?? ""} onChange={set("og_image_url")} placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Twitter / X site (optional)</label>
            <input className={field} value={form.twitter_site ?? ""} onChange={set("twitter_site")} placeholder="@yourbrand or https://x.com/…" />
          </div>
        </div>
      </section>
    </div>
  );
}
