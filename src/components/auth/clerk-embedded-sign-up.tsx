"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-auth-appearance";
import { RedirectToAppDashboard } from "@/components/auth/redirect-to-app-dashboard";

/** Same as sign-in: avoid mounting `<SignUp />` when signed in; route via `/dashboard` → admin layout. */
export function ClerkEmbeddedSignUp() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-[280px] animate-pulse rounded-lg bg-surface-container/40" />;
  }

  if (user) {
    return <RedirectToAppDashboard />;
  }

  return (
    <SignUp
      appearance={clerkAuthAppearance}
      routing="hash"
      signInUrl="/login"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
