import type { Metadata } from "next";
import { UserDashboardOrdersNoSSR } from "@/components/dashboard/user-dashboard-orders-no-ssr";

export const metadata: Metadata = {
  title: "My Orders | Curator SMM",
  description: "SMM delivery orders and premium account subscriptions.",
};

export default function DashboardOrdersPage() {
  return <UserDashboardOrdersNoSSR />;
}
