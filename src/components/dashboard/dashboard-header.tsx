
"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const currentNavItem = navItems.find((item) => item.href === pathname);
  const title = currentNavItem ? currentNavItem.label : "Dashboard";

  return (
    <h1 className="flex-1 text-xl font-semibold tracking-tight">{title}</h1>
  );
}
