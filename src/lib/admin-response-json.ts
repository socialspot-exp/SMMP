/**
 * Parse admin API responses without throwing when the server returns HTML
 * (Clerk/sign-in page, Next error page, middleware redirect) instead of JSON.
 */
function responseLooksLikeHtml(text: string): boolean {
  const t = text.trim();
  if (!t.startsWith("<")) return false;
  const head = t.slice(0, 800).toLowerCase();
  return (
    head.includes("doctype") ||
    head.includes("<html") ||
    head.includes("<head") ||
    head.includes("__next") ||
    head.includes("next.js")
  );
}

export async function readAdminResponseJson(res: Response): Promise<{
  data: unknown;
  notJsonMessage: string | null;
}> {
  const text = await res.text();
  const trimmed = text.trim();
  if (responseLooksLikeHtml(text)) {
    const hint =
      res.status === 401 || res.status === 403
        ? "Not authorized — sign in, then open Admin again."
        : `Server returned HTML (HTTP ${res.status}) instead of JSON — usually a Next.js crash or auth page. Check the terminal running dev for the stack trace, and Network → Response for this URL.`;
    return { data: null, notJsonMessage: hint };
  }
  try {
    return { data: JSON.parse(text) as unknown, notJsonMessage: null };
  } catch {
    return {
      data: null,
      notJsonMessage:
        trimmed.length === 0
          ? `Empty response (HTTP ${res.status}).`
          : "Response was not valid JSON.",
    };
  }
}

/** Turn API `{ error, details }` into a single line for the UI. */
export function formatAdminApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const o = data as Record<string, unknown>;
  if (typeof o.error !== "string") return "Request failed";
  let s = o.error;
  const details = o.details;
  if (details && typeof details === "object") {
    const d = details as {
      fieldErrors?: Record<string, string[] | unknown>;
      formErrors?: string[];
    };
    const fe = d.fieldErrors;
    if (fe && typeof fe === "object") {
      const parts = Object.entries(fe).flatMap(([k, v]) =>
        Array.isArray(v) ? v.map((x) => `${k}: ${String(x)}`) : []
      );
      if (parts.length) s = `${s} — ${parts.join("; ")}`;
    }
    if (Array.isArray(d.formErrors) && d.formErrors.length) {
      s = `${s} — ${d.formErrors.join("; ")}`;
    }
  }
  return s;
}
