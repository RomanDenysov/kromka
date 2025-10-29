import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";

type Props = {
  readonly children: ReactNode;
};

const counstBadges = {
  "b2c.orders": 10,
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
      <AppSidebar counstBadges={counstBadges} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
