import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";

type Props = {
  readonly children: ReactNode;
};

const badgeCounts = {
  "b2c.orders": 10,
  "b2b.orders": 5,
  "b2b.invoices": 20,
  "blog.comments": 30,
};

export default function AdminLayout({ children }: Props) {
  // const session = await getSession();
  // if (!session?.user) {
  //   notFound();
  // }
  // await assertPerm("admin.read");
  return (
    <SidebarProvider>
      <AppSidebar badgeCounts={badgeCounts} collapsible="icon" />
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
