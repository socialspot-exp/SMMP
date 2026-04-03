import type { User } from "@clerk/backend";
import { clerkClient } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type AdminUserRow = {
  id: string;
  userNo: number | null;
  name: string;
  email: string;
  username: string | null;
  imageUrl: string | null;
  registeredLabel: string;
  ordersDisplay: string;
  spentDisplay: string;
  walletBalance: number;
  status: "active" | "new" | "banned" | "locked";
  avatarRingClass: string;
};

const RINGS = [
  "bg-primary/15",
  "bg-secondary/15",
  "bg-tertiary-container/40",
  "bg-surface-variant",
  "bg-secondary-container/50",
];

function ringForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 997;
  return RINGS[h % RINGS.length]!;
}

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

function rowStatus(u: User): AdminUserRow["status"] {
  if (u.banned) return "banned";
  if (u.locked) return "locked";
  const primary = u.primaryEmailAddressId
    ? u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
    : u.emailAddresses[0];
  const verified = primary?.verification?.status === "verified";
  if (!verified) return "new";
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  if (u.createdAt > weekAgo) return "new";
  return "active";
}

function clerkUserToRow(u: User): AdminUserRow {
  const primary = u.primaryEmailAddressId
    ? u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
    : u.emailAddresses[0];
  const email = primary?.emailAddress ?? "—";
  const name =
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    u.username ||
    (email.includes("@") ? email.split("@")[0] : email) ||
    u.id;

  return {
    id: u.id,
    userNo: null,
    name,
    email,
    username: u.username,
    imageUrl: u.hasImage ? u.imageUrl : null,
    registeredLabel: formatDate(u.createdAt),
    ordersDisplay: "—",
    spentDisplay: "—",
    walletBalance: 0,
    status: rowStatus(u),
    avatarRingClass: ringForId(u.id),
  };
}

export type FetchAdminUsersResult = {
  users: AdminUserRow[];
  totalCount: number;
  error: string | null;
};

const LIST_LIMIT = 100;

/**
 * Lists users from Clerk (authoritative). Merges `user_no` from Supabase `profiles` when present.
 */
export async function fetchAdminUsersList(): Promise<FetchAdminUsersResult> {
  try {
    const client = await clerkClient();
    const { data: clerkUsers, totalCount } = await client.users.getUserList({
      limit: LIST_LIMIT,
      orderBy: "-created_at",
    });

    const rows = clerkUsers.map(clerkUserToRow);

    const supabase = createSupabaseAdmin();
    if (supabase && rows.length > 0) {
      try {
        const ids = rows.map((r) => r.id);
        const { data: profiles, error: profileErr } = await supabase
          .from("profiles")
          .select("id, user_no, wallet_balance")
          .in("id", ids);

        if (!profileErr && profiles) {
          const byId = new Map(
            profiles.map((p: { id: string; user_no: number | string | null; wallet_balance: number | string | null }) => [
              p.id,
              {
                userNo: p.user_no != null ? Number(p.user_no) : null,
                walletBalance: p.wallet_balance != null ? Number(p.wallet_balance) : 0,
              },
            ])
          );
          for (const row of rows) {
            const data = byId.get(row.id);
            if (data) {
              if (data.userNo != null) row.userNo = data.userNo;
              row.walletBalance = data.walletBalance;
            }
          }
        }
      } catch {
        /* profiles / user_no / wallet_balance optional — Clerk list still valid */
      }
    }

    return {
      users: rows,
      totalCount,
      error: null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load users";
    return {
      users: [],
      totalCount: 0,
      error: message,
    };
  }
}
