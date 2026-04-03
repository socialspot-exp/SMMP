import type { Metadata } from "next";
import { UserDashboardSettings } from "@/components/dashboard/user-dashboard-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings | Curator SMM",
  description: "Manage your profile, security, and account settings.",
};

export default function DashboardSettingsPage() {
  return <UserDashboardSettings />;
}

