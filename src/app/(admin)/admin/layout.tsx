import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { assertPerm } from "@/lib/auth/rbac";
import { getSession } from "@/lib/get-session";
import AppSidebar from "./app-sidebar";
import { getAdminNav, getBadgeCounts } from "./get-sidebar-data";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const session = await getSession();
  if (!session?.user) {
    notFound();
  }
  await assertPerm("admin.read");

  // Fetch navigation and badge counts server-side
  const [navigation, badgeCounts] = await Promise.all([
    getAdminNav(),
    getBadgeCounts(),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
        badgeCounts={badgeCounts}
        collapsible="icon"
        navigation={navigation}
      />
      <SidebarInset>
        <div className="flex h-12 items-center border-b px-2">
          <SidebarTrigger />
          <span className="ml-2 font-medium">Admin</span>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
