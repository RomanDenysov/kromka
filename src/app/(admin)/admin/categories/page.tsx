import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/ui/data-table-skeleton";
import { CategoriesTable } from "@/components/tables/categories/table";
import { db } from "@/db";

export default async function B2CCategoriesPage() {
  const categories = await db.query.categories.findMany();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
        ]}
      />
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <CategoriesTable categories={categories} />
      </Suspense>
    </>
  );
}
