import type { Metadata } from "next";
import { type CSSProperties, Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MainSidebar from "@/widgets/admin-sidebar/main-sidebar";

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
  dailyView,
}: LayoutProps<"/admin">) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 12)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <MainSidebar />

      <SidebarInset>{children}</SidebarInset>
      <Suspense
        fallback={
          <div className="hidden h-svh w-0 shrink-0 overflow-hidden lg:block" />
        }
      >
        {dailyView}
      </Suspense>
    </SidebarProvider>
  );
}
