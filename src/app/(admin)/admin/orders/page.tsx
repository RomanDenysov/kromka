import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { OrdersTable } from "@/components/tables/orders/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function B2COrdersPage() {
  prefetch(trpc.admin.orders.list.queryOptions());

  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Objednávky", href: "/admin/orders" },
        ]}
      />
      <section className="h-full flex-1">
        <ErrorBoundary fallback={<div>Error loading orders</div>}>
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}
          >
            <OrdersTable />
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrateClient>
  );
}
