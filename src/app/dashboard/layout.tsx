import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard | Curator SMM",
  description: "Your orders, subscriptions, wallet, and activity.",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  return <UserDashboardShell>{children}</UserDashboardShell>;
}
