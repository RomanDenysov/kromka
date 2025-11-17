import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/ui/data-table-skeleton";
import { CategoriesTable } from "@/components/tables/categories/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function B2CCategoriesPage() {
  prefetch(trpc.admin.categories.list.queryOptions());
  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
        ]}
      />
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <CategoriesTable />
      </Suspense>
    </HydrateClient>
  );
}
