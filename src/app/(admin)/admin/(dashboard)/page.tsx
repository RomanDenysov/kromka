import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { RecentOrdersTable } from "@/components/tables/recent-orders/table";
import { getRecentOrders } from "@/lib/queries/dashboard";

export default async function AdminPage() {
  const orders = await getRecentOrders();
  return (
    <div className="grow overflow-hidden">
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <RecentOrdersTable orders={orders} />
      </Suspense>
    </div>
  );
}
