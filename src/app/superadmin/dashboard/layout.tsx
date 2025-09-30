
import type { PropsWithChildren } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { UserNav } from "@/components/dashboard/user-nav";
import { SuperAdminNav } from "@/components/superadmin/super-admin-nav";

export default function SuperAdminDashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SuperAdminNav />
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col w-full">
            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                <SidebarTrigger variant="ghost" size="icon" className="md:hidden size-8" />
                <h1 className="flex-1 text-xl font-semibold tracking-tight">Super Admin</h1>
                <UserNav />
            </header>
            <main className="flex-1 p-4 md:p-8 lg:p-10 bg-muted/40 overflow-y-auto">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
