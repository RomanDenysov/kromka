import { Suspense } from "react";
import { CategoriesTable } from "@/components/tables/categories/table";
import { db } from "@/db";
import { DataTableSkeleton } from "@/widgets/data-table/ui/data-table-skeleton";

export default async function B2CCategoriesPage() {
  const categories = await db.query.categories.findMany();

  return (
    <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
      <CategoriesTable categories={categories} />
    </Suspense>
  );
}
