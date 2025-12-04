"use cache";
import { type CSSProperties, type ReactNode, Suspense } from "react";
import AppSidebar from "@/components/admin-sidebar/app-sidebar";
import { AdminDrawersProvider } from "@/components/drawers/admin-drawers-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getNewOrdersCount } from "@/lib/queries/orders";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const newOrdersCount = await getNewOrdersCount();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 48)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar collapsible="icon" newOrdersCount={newOrdersCount} />
      <SidebarInset>
        <div className="relative size-full min-h-svh flex-1">{children}</div>
      </SidebarInset>
      <Suspense>
        <AdminDrawersProvider />
      </Suspense>
    </SidebarProvider>
  );
}
