import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminPremiumOrdersView } from "@/components/admin/admin-premium-orders-view";

export const metadata: Metadata = {
  title: "Premium Orders | Curator Market Admin",
  description: "Manage and track high-value premium account fulfillment.",
};

export default function AdminPremiumOrdersPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
        <AdminPremiumOrdersView />
      </div>
      <div className="min-h-screen bg-surface lg:hidden">
        <AdminPremiumOrdersView />
      </div>
    </>
  );
}
