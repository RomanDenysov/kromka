import { AdminHeader } from "@/components/shared/admin-header";

export default function B2CAdminHeaderPage() {
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "B2C", href: "/admin/b2c" },
      ]}
    />
  );
}
