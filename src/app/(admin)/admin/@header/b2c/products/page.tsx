import { AdminHeader } from "@/components/admin-header/admin-header";

export default function B2CProductsAdminHeaderPage() {
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Produkty", href: "/admin/b2c/products" },
      ]}
    />
  );
}
