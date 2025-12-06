import { desc } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { CategoriesTable } from "@/components/tables/categories/table";
import { db } from "@/db";
import { categories } from "@/db/schema";

async function getCategories() {
  "use cache";
  cacheLife("minutes");
  return await db.query.categories.findMany({
    with: {
      products: true,
      image: true,
    },
    orderBy: desc(categories.createdAt),
  });
}

export default function CategoriesPage() {
  const categoriesPromise = getCategories();
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
        ]}
      />
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <CategoriesTable categoriesPromise={categoriesPromise} />
      </Suspense>
    </>
  );
}
