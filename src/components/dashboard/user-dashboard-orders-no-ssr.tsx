"use client";

import dynamic from "next/dynamic";

const UserDashboardOrders = dynamic(
  () => import("./user-dashboard-orders").then((m) => m.UserDashboardOrders),
  { ssr: false }
);

export function UserDashboardOrdersNoSSR() {
  return <UserDashboardOrders />;
}

