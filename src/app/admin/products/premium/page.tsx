import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminPremiumProductsView } from "@/components/admin/admin-premium-products-view";

export const metadata: Metadata = {
  title: "Premium Products | Curator Market Admin",
  description: "Manage premium account and subscription SKUs.",
};

export default function AdminPremiumProductsPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
      </div>
      <div className="min-h-screen bg-surface">
        <AdminPremiumProductsView />
      </div>
    </>
  );
}
