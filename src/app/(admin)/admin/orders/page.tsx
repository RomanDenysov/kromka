import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { OrdersTable } from "@/components/tables/orders/table";
import { getAllOrders } from "@/lib/queries/orders";

export default async function B2COrdersPage() {
  const fetchedOrders = await getAllOrders();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Objednávky", href: "/admin/orders" },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <OrdersTable orders={fetchedOrders} />
        </Suspense>
      </section>
    </>
  );
}
