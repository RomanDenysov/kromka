import { AdminHeader } from "@/components/admin-header/admin-header";

export default function SettingsPage() {
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Nastavenia", href: "/admin/settings" },
      ]}
    />
  );
}
