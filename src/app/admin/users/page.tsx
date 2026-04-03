import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminUsersView } from "@/components/admin/admin-users-view";
import { fetchAdminUsersList } from "@/lib/fetch-admin-users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "User Management | Curator Market Admin",
  description: "Manage and monitor registered platform curators.",
};

export default async function AdminUsersPage() {
  const { users, totalCount, error } = await fetchAdminUsersList();

  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
        <AdminUsersView users={users} totalCount={totalCount} fetchError={error} />
      </div>
      <div className="min-h-screen bg-surface lg:hidden">
        <AdminUsersView users={users} totalCount={totalCount} fetchError={error} />
      </div>
    </>
  );
}
