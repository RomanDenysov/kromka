import { Suspense } from "react";
import { OrdersTable } from "@/components/tables/orders/table";
import { getAllOrders } from "@/features/orders/api/queries";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function OrdersLoader() {
  const orders = await getAllOrders();
  return <OrdersTable orders={orders} />;
}

export default function B2COrdersPage() {
  return (
    <section className="h-full flex-1">
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <OrdersLoader />
      </Suspense>
    </section>
  );
}
