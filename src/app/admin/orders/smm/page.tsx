import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminSmmOrdersView } from "@/components/admin/admin-smm-orders-view";

export const metadata: Metadata = {
  title: "SMM Orders | Curator Market Admin",
  description: "Manage and track customer SMM service requests.",
};

export default function AdminSmmOrdersPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
        <AdminSmmOrdersView />
      </div>
      <div className="min-h-screen bg-surface lg:hidden">
        <AdminSmmOrdersView />
      </div>
    </>
  );
}
