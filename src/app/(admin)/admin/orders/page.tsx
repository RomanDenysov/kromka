import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/ui/data-table-skeleton";
import { HydrateClient } from "@/trpc/server";

export default function B2COrdersPage() {
  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Objednávky", href: "/admin/orders" },
        ]}
      />
      <section className="h-full flex-1 p-4">
        <ErrorBoundary fallback={<div>Error loading orders</div>}>
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}
          >
            <div>Orders</div>
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrateClient>
  );
}
