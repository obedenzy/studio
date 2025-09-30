
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Building, User, LogOut, CreditCard } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/superadmin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/superadmin/dashboard/businesses", icon: Building, label: "Businesses" },
  { href: "/superadmin/dashboard/payments", icon: CreditCard, label: "Payments" },
  { href: "/superadmin/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/superadmin/dashboard/profile", icon: User, label: "Profile" },
];

export function SuperAdminNav() {
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
            isActive={pathname.startsWith(item.href) && (item.href.length > 18 ? true : pathname === item.href)}
            onClick={handleLinkClick}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
       <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Logout">
            <Link href="/">
                <LogOut />
                <span>Logout</span>
            </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
