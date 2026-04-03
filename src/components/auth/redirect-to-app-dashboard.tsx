"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** After sign-in/up, land on the user dashboard (admins can open `/admin` from the menu). */
export function RedirectToAppDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-[120px] animate-pulse rounded-lg bg-surface-container/40" />
  );
}
