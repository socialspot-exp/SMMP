import type { Metadata } from "next";
import { ClerkEmbeddedSignUp } from "@/components/auth/clerk-embedded-sign-up";
import { AuthCard } from "@/components/auth/auth-card";
import { ServicesChrome } from "@/components/layout/services-chrome";

export const metadata: Metadata = {
  title: "Register | Curator Market",
  description:
    "Create a Curator Market account — premium SMM and digital assets.",
};

export default function SignupPage() {
  return (
    <ServicesChrome showFab={false}>
      <div className="mx-auto min-h-[calc(100vh-12rem)] max-w-md px-4 py-10 lg:flex lg:min-h-[calc(100vh-16rem)] lg:items-center lg:py-16">
        <div className="w-full">
          <AuthCard>
            <ClerkEmbeddedSignUp />
          </AuthCard>
        </div>
      </div>
    </ServicesChrome>
  );
}
