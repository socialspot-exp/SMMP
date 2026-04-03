import type { Metadata } from "next";
import { UserWalletTransactions } from "@/components/dashboard/user-wallet-transactions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wallet Transactions | Curator SMM",
  description: "Full wallet transaction history.",
};

export default function WalletTransactionsPage() {
  return <UserWalletTransactions />;
}

