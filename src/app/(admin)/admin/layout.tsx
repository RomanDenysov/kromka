import { cookies } from "next/headers";
import { forbidden } from "next/navigation";
import { type CSSProperties, type ReactNode, Suspense } from "react";
import AppSidebar, {
  AppSidebarSkeleton,
} from "@/components/admin-sidebar/app-sidebar";
import { AdminDrawersProvider } from "@/components/drawers/admin-drawers-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth/server";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // Admin guard: only allow users with admin role
  const session = await auth.api.getSession({
    headers: { Cookie: cookieStore.toString() },
  });
  if (session?.user?.role !== "admin") {
    forbidden();
  }

  prefetch(
    trpc.admin.orders.list.queryOptions({
      status: "new",
    })
  );

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
      <HydrateClient>
        <Suspense fallback={<AppSidebarSkeleton collapsible="icon" />}>
          <AppSidebar collapsible="icon" />
        </Suspense>
      </HydrateClient>
      <SidebarInset>
        <div className="relative grid size-full h-svh grid-rows-[auto_1fr]">
          {children}
        </div>
      </SidebarInset>
      <Suspense>
        <AdminDrawersProvider />
      </Suspense>
    </SidebarProvider>
  );
}
