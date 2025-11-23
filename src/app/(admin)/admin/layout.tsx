import { cookies, headers } from "next/headers";
import { forbidden } from "next/navigation";
import { type CSSProperties, type ReactNode, Suspense } from "react";
import AppSidebar from "@/components/app-sidebar";
import { AdminDrawersProvider } from "@/components/drawers/admin-drawers-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth/server";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== "admin") {
    forbidden();
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 48)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <div className="grid size-full h-svh grid-rows-[auto_1fr]">
          {children}
        </div>
      </SidebarInset>
      <Suspense>
        <AdminDrawersProvider />
      </Suspense>
    </SidebarProvider>
  );
}
