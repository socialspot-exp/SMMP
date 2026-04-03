"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";

/**
 * Mirrors Clerk session into local AuthProvider (cart / dashboard copy).
 * POSTs to /api/profile/sync so a row exists in Supabase `profiles` when configured.
 */
export function ClerkAuthBridge() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signIn, signOut } = useAuth();
  const hadClerkSession = useRef(false);
  const syncedProfile = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (clerkUser) {
      hadClerkSession.current = true;
      const email = clerkUser.primaryEmailAddress?.emailAddress ?? "";
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
        clerkUser.username ||
        undefined;
      if (email) {
        signIn({ email, name });
      }
      if (syncedProfile.current !== clerkUser.id) {
        syncedProfile.current = clerkUser.id;
        void fetch("/api/profile/sync", { method: "POST" }).catch(() => {});
      }
      return;
    }

    if (hadClerkSession.current) {
      hadClerkSession.current = false;
      syncedProfile.current = null;
      signOut();
    }
  }, [isLoaded, clerkUser, signIn, signOut]);

  return null;
}
