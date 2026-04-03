import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { WebhookEvent } from "@clerk/nextjs/server";
import type { UserJSON } from "@clerk/backend";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  deleteProfileByClerkId,
  upsertProfileFromClerkUser,
} from "@/lib/upsert-clerk-profile";

/**
 * Clerk → Supabase sync. Dashboard → Webhooks → Add endpoint:
 *   https://YOUR_DOMAIN/api/webhooks/clerk
 * Events: user.created, user.updated, user.deleted
 * Signing secret → CLERK_WEBHOOK_SIGNING_SECRET in .env.local
 *
 * Local dev: use `ngrok http 3000` (or Clerk dev proxy) — localhost is not reachable by Clerk.
 */
export async function POST(req: NextRequest) {
  let evt: WebhookEvent;

  try {
    evt = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const result = await upsertProfileFromClerkUser(evt.data as UserJSON);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.message, reason: result.reason },
          { status: result.reason === "no_admin" ? 503 : 500 }
        );
      }
    }

    if (evt.type === "user.deleted") {
      const id = evt.data.id;
      if (id) {
        const result = await deleteProfileByClerkId(id);
        if (!result.ok) {
          return NextResponse.json(
            { error: result.message, reason: result.reason },
            { status: result.reason === "no_admin" ? 503 : 500 }
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
