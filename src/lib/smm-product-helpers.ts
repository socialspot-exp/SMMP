import type { SMMService } from "@/lib/services-data";

export function smmProductPath(s: Pick<SMMService, "id" | "slug">): string {
  return `/services/smm/${s.slug ?? s.id}`;
}

export function slugifySmmProductLabel(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return s.length > 0 ? s : "smm-service";
}
