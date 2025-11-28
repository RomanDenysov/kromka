import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { ProductsTable } from "@/components/tables/products/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function ProductsPage() {
  prefetch(trpc.admin.products.list.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <AdminHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/admin" },
            { label: "Produkty", href: "/admin/products" },
          ]}
        />
        <section className="h-full flex-1">
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}
          >
            <ProductsTable />
          </Suspense>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
