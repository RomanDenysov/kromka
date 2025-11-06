import { AdminHeader } from "@/components/admin-header/admin-header";
import { CategoriesToolbar } from "@/features/b2c/category-management/ui/categories-toolbar";

export default function B2CCategoriesAdminHeader() {
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Kategórie", href: "/admin/b2c/categories" },
      ]}
    >
      <CategoriesToolbar />
    </AdminHeader>
  );
}
