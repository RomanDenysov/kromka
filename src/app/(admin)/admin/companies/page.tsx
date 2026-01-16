import { AdminHeader } from "@/widgets/admin-header/admin-header";

export default function B2BCompaniesPage() {
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Klienty", href: "/admin/companies" },
      ]}
    />
  );
}
