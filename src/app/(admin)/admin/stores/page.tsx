import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { StoresTable } from "@/components/tables/stores/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DataTableSkeleton } from "@/widgets/data-table/ui/data-table-skeleton";

export default function StoresPage() {
  prefetch(trpc.admin.stores.list.queryOptions());
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <StoresTable />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
