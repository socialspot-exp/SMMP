import type { Metadata } from "next";
import { UserDashboardWallet } from "@/components/dashboard/user-dashboard-wallet";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wallet | Curator SMM",
  description: "Manage your wallet balance and top-up funds for orders.",
};

export default function DashboardWalletPage() {
  return <UserDashboardWallet />;
}
