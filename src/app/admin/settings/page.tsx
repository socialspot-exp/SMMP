import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { AdminSiteSettingsView } from "@/components/admin/admin-site-settings-view";

export const metadata: Metadata = {
  title: "Site settings | Curator Market Admin",
  description: "Branding, SEO, logo, and favicon for the storefront.",
};

export default function AdminSettingsPage() {
  return (
    <>
      <div className="hidden lg:block">
        <AdminTopBar />
      </div>
      <div className="min-h-screen bg-surface">
        <AdminSiteSettingsView />
      </div>
    </>
  );
}
