"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-auth-appearance";
import { RedirectToAppDashboard } from "@/components/auth/redirect-to-app-dashboard";

/**
 * Clerk redirects signed-in users to Home URL if `<SignIn />` mounts (single-session).
 * We skip mounting until signed out so /login stays usable and isn’t a blind bounce to /.
 * Signed-in users go to `/dashboard`; admins are sent to `/admin` by `dashboard/layout`.
 */
export function ClerkEmbeddedSignIn() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-[240px] animate-pulse rounded-lg bg-surface-container/40" />;
  }

  if (user) {
    return <RedirectToAppDashboard />;
  }

  return (
    <SignIn
      appearance={clerkAuthAppearance}
      routing="hash"
      signInUrl="/login"
      signUpUrl="/signup"
      fallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}
