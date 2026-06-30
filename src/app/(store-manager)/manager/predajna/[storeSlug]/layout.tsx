import type { CSSProperties, ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import StoreSidebar from "@/widgets/store-manager-sidebar/store-sidebar";

interface Props {
  readonly children: ReactNode;
  params: Promise<{ storeSlug: string }>;
}

export default function StoreLayout({ children, params }: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <StoreSidebar collapsible="icon" params={params} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
