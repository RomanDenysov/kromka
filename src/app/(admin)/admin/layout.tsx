import type { Metadata } from "next";
import { type CSSProperties, type ReactNode, Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getNewOrdersCount } from "@/features/orders/api/queries";
import AppSidebar, {
  AppSidebarSkeleton,
} from "@/widgets/admin-sidebar/app-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin panel",
    template: "%s | Pekáreň Kromka – Admin",
  },
  description:
    "Admin panel Pekárne Kromka. Zobrazí sa iba pre administrátorov.",
};

type Props = {
  readonly children: ReactNode;
};

async function AdminSidebarLoader() {
  const newOrdersCount = await getNewOrdersCount();
  return <AppSidebar collapsible="icon" newOrdersCount={newOrdersCount} />;
}

export default function AdminLayout({ children }: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 48)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <Suspense fallback={<AppSidebarSkeleton />}>
        <AdminSidebarLoader />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
