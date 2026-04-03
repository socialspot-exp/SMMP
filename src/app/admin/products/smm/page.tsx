import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminSmmProductsView } from "@/components/admin/admin-smm-products-view";

export const metadata: Metadata = {
  title: "SMM Products | Curator Market Admin",
  description:
    "Create and edit Supabase SMM products: taxonomy, slug, SEO, pricing, and storefront copy.",
};

export default function AdminSmmProductsPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
      </div>
      <div className="min-h-screen bg-surface">
        <AdminSmmProductsView />
      </div>
    </>
  );
}
