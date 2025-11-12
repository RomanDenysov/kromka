import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CategoriesTable } from "@/components/tables/categories/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DataTableSkeleton } from "@/widgets/data-table/ui/data-table-skeleton";

export default function B2CCategoriesPage() {
  prefetch(trpc.admin.categories.list.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <CategoriesTable />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
