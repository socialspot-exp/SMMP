import type { Metadata } from "next";
import { ServicesView } from "@/components/services/services-view";

export const metadata: Metadata = {
  title: "Services | Dashboard | Curator SMM",
  description: "Browse SMM and premium account services from your dashboard.",
};

export default function DashboardServicesPage() {
  return <ServicesView variant="dashboard" />;
}
