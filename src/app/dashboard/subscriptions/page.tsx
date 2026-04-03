import type { Metadata } from "next";
import { UserDashboardSubscriptionsNoSSR } from "@/components/dashboard/user-dashboard-subscriptions-no-ssr";

export const metadata: Metadata = {
  title: "Subscriptions | Curator SMM",
  description: "Premium account subscriptions and renewals.",
};

export default function DashboardSubscriptionsPage() {
  return <UserDashboardSubscriptionsNoSSR />;
}

