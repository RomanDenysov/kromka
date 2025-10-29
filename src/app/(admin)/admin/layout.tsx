import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { assertPerm } from "@/lib/auth/rbac";
import { getSession } from "@/lib/get-session";
import AppSidebar from "./app-sidebar";
import { getAdminNav } from "./nav";

type Props = {
  readonly children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const session = await getSession();
  if (!session?.user) {
    notFound();
  }
  await assertPerm("admin.read");
  const navigation = await getAdminNav();
  return (
    <SidebarProvider>
      <AppSidebar navigation={navigation} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
