import { count, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";
import { type CSSProperties, type ReactNode, Suspense } from "react";
import AppSidebar, {
  AppSidebarSkeleton,
} from "@/components/admin-sidebar/app-sidebar";
import { AdminDrawersProvider } from "@/components/drawers/admin-drawers-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getAuth } from "@/lib/auth/session";
import { HydrateClient } from "@/trpc/server";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // Admin guard: only allow users with admin role
  const { user } = await getAuth();
  if (user?.role !== "admin") {
    forbidden();
  }

  const [{ count: newOrdersCount }] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"));

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
          <AppSidebar collapsible="icon" newOrdersCount={newOrdersCount} />
        </Suspense>
      </HydrateClient>
      <SidebarInset>
        <div className="relative size-full min-h-svh flex-1">{children}</div>
      </SidebarInset>
      <Suspense>
        <AdminDrawersProvider />
      </Suspense>
    </SidebarProvider>
  );
}
