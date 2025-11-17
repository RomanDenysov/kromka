import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import NotFound from "@/app/not-found";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/ui/data-table-skeleton";
import { ProductsTable } from "@/components/tables/products/table";
import { db } from "@/db";
import { HydrateClient } from "@/trpc/server";

// biome-ignore lint/suspicious/useAwait: <explanation>
export default async function B2CProductsPage() {
  const products = await db.query.products.findMany();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<NotFound />}>
        <AdminHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/admin" },
            { label: "Produkty", href: "/admin/products" },
          ]}
        />

        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <ProductsTable products={products} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
