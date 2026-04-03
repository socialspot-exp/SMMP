import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { isAppAdminUser } from "@/lib/clerk-role";
import "./admin.css";

export const metadata: Metadata = {
  title: "Curator Market Admin Dashboard",
  description: "Admin portal for Curator Market — orders, catalog, and analytics.",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  if (!isAppAdminUser(user)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background font-body text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <AdminSidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
