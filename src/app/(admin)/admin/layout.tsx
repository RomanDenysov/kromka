import { cookies } from "next/headers";
import type { CSSProperties, ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getBadgeCounts, getNav } from "@/widgets/admin-sidebar/model/get-nav";
import AppSidebar from "@/widgets/admin-sidebar/ui/app-sidebar";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const [navigation, badgeCounts] = await Promise.all([
    getNav(cookieStore.toString()),
    getBadgeCounts(),
  ]);

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 48)",
          "--header-height": "calc(var(--spacing) * 10)",
        } as CSSProperties
      }
    >
      <AppSidebar
        badgeCounts={badgeCounts}
        collapsible="icon"
        navigation={navigation}
      />
      <SidebarInset>
        <div className="grid size-full h-svh grid-rows-[auto_1fr]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
