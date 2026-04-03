import type { Metadata } from "next";
import { ClerkEmbeddedSignIn } from "@/components/auth/clerk-embedded-sign-in";
import { AuthCard } from "@/components/auth/auth-card";
import { ServicesChrome } from "@/components/layout/services-chrome";

export const metadata: Metadata = {
  title: "Login | Curator Market",
  description:
    "Sign in to Curator Market — orders, services, and premium digital assets.",
};

export default function LoginPage() {
  return (
    <ServicesChrome showFab={false}>
      <div className="mx-auto min-h-[calc(100vh-12rem)] max-w-md px-4 py-10 lg:flex lg:min-h-[calc(100vh-16rem)] lg:items-center lg:py-16">
        <div className="w-full">
          <AuthCard>
            <ClerkEmbeddedSignIn />
          </AuthCard>
        </div>
      </div>
    </ServicesChrome>
  );
}
