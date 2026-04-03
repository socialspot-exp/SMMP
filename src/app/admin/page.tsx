import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { AdminMobileShell } from "@/components/admin/admin-mobile-shell";
import { AdminTopBar } from "@/components/admin/admin-top-bar";

export default function AdminDashboardPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
        <AdminDashboardView />
      </div>
      <AdminMobileShell />
    </>
  );
}
