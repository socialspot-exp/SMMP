/** Local part of email, lowercased (e.g. xyz@gmail.com → xyz). */
export function emailLocalPart(email: string): string {
  const at = email.indexOf("@");
  const local = (at === -1 ? email : email.slice(0, at)).trim().toLowerCase();
  return local;
}

function slugSegment(raw: string): string {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/\./g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  if (!s) s = "user";
  return s.slice(0, 30);
}

/**
 * Safe handle from email local part: a–z, 0–9, underscore; dots → underscore.
 * Empty / invalid → "user".
 */
export function usernameBaseFromEmail(email: string | null | undefined): string {
  if (!email?.trim()) return "user";
  return slugSegment(emailLocalPart(email));
}

/** When there is no email yet, derive from Clerk `username` the same way. */
export function usernameBaseFromClerkHandle(handle: string | null | undefined): string {
  if (!handle?.trim()) return "user";
  return slugSegment(handle);
}
