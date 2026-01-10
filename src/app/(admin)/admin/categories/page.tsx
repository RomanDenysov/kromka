import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { EditCategorySheet } from "@/app/(admin)/admin/categories/[id]/edit-category-sheet";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { CategoriesTable } from "@/components/tables/categories/table";
import {
  getAdminCategories,
  getAdminCategoryById,
} from "@/features/categories/queries";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function CategoriesLoader() {
  const categories = await getAdminCategories();
  return <CategoriesTable categories={categories} />;
}

async function CategorySheetLoader({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { categoryId } = await searchParams;
  const category = await getAdminCategoryById(categoryId as string);
  const categories = await getAdminCategories();
  if (!category) {
    return null;
  }
  return <EditCategorySheet categories={categories} category={category} />;
}

export default function CategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <CategoriesLoader />
        </Suspense>
      </section>
      <Suspense fallback={null}>
        <CategorySheetLoader searchParams={searchParams} />
      </Suspense>
    </>
  );
}
