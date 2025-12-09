import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { OrdersTable } from "@/components/tables/orders/table";
import { getAllOrders } from "@/lib/queries/orders";

async function OrdersLoader() {
  const orders = await getAllOrders();
  return <OrdersTable orders={orders} />;
}

export default function B2COrdersPage() {
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
          <OrdersLoader />
        </Suspense>
      </section>
    </>
  );
}
