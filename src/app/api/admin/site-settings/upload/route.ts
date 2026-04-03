import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { mergeSiteSettings, type SiteSettingsRow } from "@/lib/site-settings";
import { requireAdminApi } from "@/lib/require-admin-api";

const BUCKET = "site-branding";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const LOGO_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const FAVICON_MIME = new Set([
  "image/png",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

function extFrom(file: File): string {
  const byMime: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
  };
  if (byMime[file.type]) return byMime[file.type]!;
  const name = file.name || "";
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "bin";
}

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  if (kind !== "logo" && kind !== "favicon") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const formData = await req.formData();
  const fileValue = formData.get("file");
  if (!(fileValue instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }
  const file = fileValue;

  if (!file.type) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 2 MB" }, { status: 400 });
  }

  const allowed = kind === "logo" ? LOGO_MIME : FAVICON_MIME;
  if (!allowed.has(file.type)) {
    return NextResponse.json(
      {
        error:
          kind === "logo"
            ? "Logo must be PNG/JPG/WEBP/SVG"
            : "Favicon must be PNG/SVG/ICO",
      },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const ext = extFrom(file);
  const objectPath = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const up = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType: file.type,
    upsert: true,
    cacheControl: "3600",
  });

  if (up.error) {
    return NextResponse.json({ error: up.error.message }, { status: 500 });
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  const column = kind === "logo" ? "logo_url" : "favicon_url";

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: "default",
        [column]: publicUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    url: publicUrl,
    settings: mergeSiteSettings(data as Partial<SiteSettingsRow>),
  });
}

