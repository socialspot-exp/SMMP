"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, Shield } from "lucide-react";
import type { ComponentProps } from "react";
import { isAppAdminClientUser } from "@/lib/clerk-role";

export type CuratorUserButtonProps = Partial<
  Pick<ComponentProps<typeof UserButton>, "appearance" | "userProfileMode">
>;

/**
 * Clerk account menu + dashboard links. Admins see Admin + User dashboard; others see Dashboard.
 * MenuItems must only have Link/Action as direct children (no Fragment).
 */
export function CuratorUserButton({
  appearance,
  userProfileMode,
}: CuratorUserButtonProps = {}) {
  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && isAppAdminClientUser(user);

  const menuItems = (
    <UserButton.MenuItems>
      {isAdmin ? (
        <UserButton.Link
          href="/admin"
          label="Admin dashboard"
          labelIcon={<Shield className="h-4 w-4" aria-hidden />}
        />
      ) : null}
      <UserButton.Link
        href="/dashboard"
        label={isAdmin ? "User dashboard" : "Dashboard"}
        labelIcon={<LayoutDashboard className="h-4 w-4" aria-hidden />}
      />
    </UserButton.MenuItems>
  );

  if (userProfileMode === "modal") {
    return (
      <UserButton appearance={appearance} userProfileMode="modal">
        {menuItems}
      </UserButton>
    );
  }

  return <UserButton appearance={appearance}>{menuItems}</UserButton>;
}
