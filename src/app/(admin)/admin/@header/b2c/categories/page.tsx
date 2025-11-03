import { AdminHeader } from "@/components/shared/admin-header";
import { CategoriesToolbar } from "./categories-toolbar";

export default function B2CCategoriesAdminHeaderPage() {
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
