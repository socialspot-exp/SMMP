import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminSmmCategoriesView } from "@/components/admin/admin-smm-categories-view";

export const metadata: Metadata = {
  title: "SMM Categories | Curator Market Admin",
  description: "Configure SMM category icons for storefront service cards.",
};

export default function AdminSmmCategoriesPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
      </div>
      <div className="min-h-screen bg-surface">
        <AdminSmmCategoriesView />
      </div>
    </>
  );
}
