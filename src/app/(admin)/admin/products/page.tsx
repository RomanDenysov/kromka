import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTable } from "@/components/tables/products/data-table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DataTableSkeleton } from "@/widgets/data-table/ui/data-table-skeleton";

// biome-ignore lint/suspicious/useAwait: <explanation>
export default async function B2CProductsPage() {
  prefetch(trpc.admin.products.list.queryOptions());

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/b2c/products" },
        ]}
      />
      <HydrateClient>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}
          >
            <DataTable />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </>
  );
}
