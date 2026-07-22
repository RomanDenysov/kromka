import { Suspense } from "react";
import { CategoriesTable } from "@/components/tables/categories/table";
import { getAdminCategories } from "@/features/categories/api/queries";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function CategoriesLoader() {
  const categories = await getAdminCategories();
  return <CategoriesTable categories={categories} />;
}

export default function CategoriesPage() {
  return (
    <section className="h-full flex-1">
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <CategoriesLoader />
      </Suspense>
    </section>
  );
}
