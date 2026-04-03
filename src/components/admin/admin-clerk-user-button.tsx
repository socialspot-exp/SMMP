"use client";

import { CuratorUserButton } from "@/components/layout/curator-user-button";

/**
 * Clerk account menu in admin chrome (replaces static avatar + chevron).
 */
export function AdminClerkUserButton() {
  return (
    <CuratorUserButton
      userProfileMode="modal"
      appearance={{
        elements: {
          userButtonTrigger:
            "flex flex-row items-center gap-2 rounded-full py-2 pr-2 pl-3 transition-colors hover:bg-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
          avatarBox: "h-8 w-8 rounded-full ring-2 ring-secondary-container/40",
          userButtonAvatarImage: "rounded-full object-cover",
        },
      }}
    />
  );
}
