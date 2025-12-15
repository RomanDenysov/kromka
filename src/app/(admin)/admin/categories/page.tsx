import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { CategoriesTable } from "@/components/tables/categories/table";
import { getAdminCategories } from "@/lib/queries/categories";

async function CategoriesLoader() {
  const categories = await getAdminCategories();
  return <CategoriesTable categories={categories} />;
}

export default function CategoriesPage() {
  return (
    <div>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
        ]}
      />
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <CategoriesLoader />
      </Suspense>
    </div>
  );
}
