import type { Metadata } from "next";
import { type CSSProperties, type ReactNode, Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DailyViewSidebar } from "@/features/daily-view-sidebar/components/daily-view-sidebar";
import { AdminSidebar } from "@/widgets/admin-sidebar/admin-sidebar";
import { AppSidebarSkeleton } from "@/widgets/admin-sidebar/main-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin panel",
    template: "%s | Pekáreň Kromka - Admin",
  },
  description:
    "Admin panel Pekárne Kromka. Zobrazí sa iba pre administrátorov.",
};

export default function AdminLayout({
  children,
  searchParams,
}: {
  children: ReactNode;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <Suspense fallback={<AppSidebarSkeleton collapsible="icon" />}>
        <AdminSidebar />
      </Suspense>

      <SidebarInset>{children}</SidebarInset>
      <Suspense
        fallback={<div className="hidden w-[300px] shrink-0 p-2 lg:block" />}
      >
        <DailyViewSidebar searchParams={searchParams} />
      </Suspense>
    </SidebarProvider>
  );
}
