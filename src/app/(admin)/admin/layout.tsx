import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { assertPermission } from "@/lib/auth/rbac";
import { getBadgeCounts, getNav } from "@/widgets/admin-sidebar/model/get-nav";
import AppSidebar from "@/widgets/admin-sidebar/ui/app-sidebar";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  await assertPermission("admin.read");

  const [navigation, badgeCounts] = await Promise.all([
    getNav(),
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
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
