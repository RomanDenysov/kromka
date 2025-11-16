import { AdminHeader } from "@/components/admin-header/admin-header";

export default function B2BCompaniesPage() {
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Klienty", href: "/admin/b2b/companies" },
      ]}
    />
  );
}
