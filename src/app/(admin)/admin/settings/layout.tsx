import { AdminHeader } from "@/components/admin-header/admin-header";
import { TabNav } from "./tab-nav";

export default function SettingsLayout({
  children,
}: LayoutProps<"/admin/settings">) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[{ label: "Nastavenia", href: "/admin/settings" }]}
      />
      <TabNav />
      <section className="h-full flex-1 p-4">{children}</section>
    </>
  );
}
