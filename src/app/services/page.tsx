import type { Metadata } from "next";
import { ServicesChrome } from "@/components/layout/services-chrome";
import { ServicesView } from "@/components/services/services-view";

export const metadata: Metadata = {
  title: "Services | Curator Market",
  description:
    "Browse SMM growth packages and premium account services with advanced filters, featured picks, ratings, and quick checkout.",
};

export default function ServicesPage() {
  return (
    <ServicesChrome>
      <ServicesView />
    </ServicesChrome>
  );
}
