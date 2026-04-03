import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { upsertProfileFromClerkBackendUser } from "@/lib/upsert-clerk-profile";

/**
 * Upserts the signed-in Clerk user into `public.profiles`.
 * Requires SUPABASE_SERVICE_ROLE_KEY + schema in supabase/migrations/
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!createSupabaseAdmin()) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        message:
          "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and run supabase/migrations/*.sql",
      },
      { status: 200 }
    );
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "No Clerk user" }, { status: 401 });
  }

  const result = await upsertProfileFromClerkBackendUser(user);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.message,
        hint: "Ensure table public.profiles exists (see supabase/migrations)",
      },
      { status: 500 }
    );
  }

  const admin = createSupabaseAdmin();
  if (admin) {
    const { data } = await admin
      .from("profiles")
      .select("user_no, username")
      .eq("id", user.id)
      .maybeSingle();
    if (data?.user_no != null) {
      const userNo =
        typeof data.user_no === "string" ? Number(data.user_no) : data.user_no;
      return NextResponse.json({
        ok: true,
        user_no: userNo,
        username: data.username,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
