import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminPremiumCategoriesView } from "@/components/admin/admin-premium-categories-view";

export const metadata: Metadata = {
  title: "Premium Categories | Curator Market Admin",
  description:
    "Manage premium catalog categories and subcategories (Supabase); icons and filters sync to the services storefront.",
};

export default function AdminPremiumCategoriesPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
      </div>
      <div className="min-h-screen bg-surface">
        <AdminPremiumCategoriesView />
      </div>
    </>
  );
}
