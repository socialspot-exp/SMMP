import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminPaymentsView } from "@/components/admin/admin-payments-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payments | Curator Market Admin",
  description: "Manage payment gateways, credentials, and webhook controls.",
};

export default function AdminPaymentsPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
      </div>
      <div className="min-h-screen bg-surface">
        <AdminPaymentsView />
      </div>
    </>
  );
}

