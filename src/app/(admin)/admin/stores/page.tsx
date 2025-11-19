import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/ui/data-table-skeleton";
import { StoresTable } from "@/components/tables/stores/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function StoresPage() {
  prefetch(trpc.admin.stores.list.queryOptions());

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody" },
        ]}
      />
      <HydrateClient>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}
          >
            <StoresTable />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </>
  );
}
