"use client";

import { UserProfile } from "@clerk/nextjs";

export function UserDashboardSettings() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:space-y-8 md:p-0">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          Settings
        </h1>
        <p className="mt-1 text-sm font-medium text-on-surface-variant">
          Update your profile, security, and connected authentication settings
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
        <div className="p-4 md:p-6">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none bg-transparent w-full",
                navbar: "bg-transparent",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

