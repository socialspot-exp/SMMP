"use client";

import dynamic from "next/dynamic";

const UserDashboardSubscriptions = dynamic(
  () =>
    import("./user-dashboard-subscriptions").then((m) => m.UserDashboardSubscriptions),
  { ssr: false }
);

export function UserDashboardSubscriptionsNoSSR() {
  return <UserDashboardSubscriptions />;
}

