import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import { getSiteSettingsServer } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Dashboard | Curator SMM",
  description: "Your orders, subscriptions, wallet, and activity.",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  let user = null;
  try {
    user = await currentUser();
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  const site = await getSiteSettingsServer();
  const headerLogoUrl = site.logo_url?.trim() || null;

  return (
    <UserDashboardShell headerLogoUrl={headerLogoUrl}>{children}</UserDashboardShell>
  );
}
