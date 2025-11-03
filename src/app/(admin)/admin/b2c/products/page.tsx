import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/shared/admin-header";
import { ProductsTable } from "@/features/b2c/product-management/ui/products-table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DataTableSkeleton } from "@/widgets/data-table/ui/data-table-skeleton";

// biome-ignore lint/suspicious/useAwait: <explanation>
export default async function B2CProductsPage() {
  prefetch(trpc.admin.products.list.queryOptions());

  return (
    <>
      <AdminHeader
        breadcrumbs={[{ label: "Produkty", href: "/admin/b2c/products" }]}
      />
      <HydrateClient>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}
          >
            <ProductsTable />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </>
  );
}
