import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/get-session";
import { getBadgeCounts, getNav } from "@/widgets/admin-sidebar/model/get-nav";
import AppSidebar from "@/widgets/admin-sidebar/ui/app-sidebar";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const _session = await getSession();
  // if (!session?.user) {
  //   notFound();
  // }
  // await assertPerm("admin.read");

  // Fetch navigation and badge counts server-side
  const navigation = await getNav();
  const badgeCounts = await getBadgeCounts();

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
