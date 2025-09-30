
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Star, User, CreditCard, Users } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/reviews", icon: Star, label: "Reviews" },
  { href: "/dashboard/users", icon: Users, label: "Users" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function DashboardNav() {
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            tooltip={item.label}
            isActive={pathname === item.href}
            onClick={handleLinkClick}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
