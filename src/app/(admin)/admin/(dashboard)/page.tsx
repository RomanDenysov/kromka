import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { RecentOrdersTable } from "@/components/tables/recent-orders/table";
import { getRecentOrders } from "@/lib/queries/dashboard";

async function RecentOrdersLoader() {
  const orders = await getRecentOrders();
  return <RecentOrdersTable orders={orders} />;
}

export default function AdminPage() {
  return (
    <div className="grow overflow-hidden">
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <RecentOrdersLoader />
      </Suspense>
    </div>
  );
}
