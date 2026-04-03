import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminPanelApisView } from "@/components/admin/admin-panel-apis-view";

export const metadata: Metadata = {
  title: "Panel API | Curator Market Admin",
  description:
    "Connect Perfect Panel–compatible reseller APIs for SMM orders — URL, key, and fulfillment actions.",
};

export default function AdminApiPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
      </div>
      <div className="min-h-screen bg-surface">
        <AdminPanelApisView />
      </div>
    </>
  );
}
