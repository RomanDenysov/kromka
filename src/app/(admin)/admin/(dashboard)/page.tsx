import { format, getMonth, getYear } from "date-fns";
import { Suspense } from "react";
import { RecentOrdersTable } from "@/components/tables/recent-orders/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMonthlyOrderStats,
  getOrdersByPickupDate,
  getProductsAggregateByPickupDate,
  getRecentOrders,
} from "@/lib/queries/dashboard";
import { DashboardMetrics } from "../_components/dashboard-metrics";
import { DashboardCalendar } from "./dashboard-calendar";
import { DashboardRecentTabs } from "./dashboard-recent-tabs";
import {
  type DashboardSearchParams,
  loadDashboardSearchParams,
} from "./dashboard-search-params";

export async function DashboardContent({
  dashboardParams,
}: {
  dashboardParams: Promise<DashboardSearchParams>;
}) {
  const { date } = await dashboardParams;

  const formattedDate = format(date, "yyyy-MM-dd");
  const year = getYear(date);
  const month = getMonth(date);
  const [orders, recentOrders, products, monthlyStats] = await Promise.all([
    getOrdersByPickupDate(formattedDate),
    getRecentOrders(),
    getProductsAggregateByPickupDate(formattedDate),
    getMonthlyOrderStats(year, month),
  ]);

  const dailyStats = monthlyStats.reduce(
    (acc, stat) => {
      if (stat.date) {
        acc[stat.date] = {
          orderCount: stat.orderCount,
          revenue: stat.totalRevenue,
        };
      }
      return acc;
    },
    {} as Record<string, { orderCount: number; revenue: number }>
  );
  return (
    <>
      <div className="flex flex-1 flex-col space-y-4 p-4">
        <DashboardMetrics />
        <div className="flex gap-8">
          <div className="shrink-0">
            <DashboardCalendar dailyStats={dailyStats} />
          </div>
          <div className="grow">
            <DashboardRecentTabs orders={orders} products={products} />
          </div>
        </div>
      </div>
      <div className="grow overflow-hidden">
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </>
  );
}

export default function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin">) {
  const dashboardParams = loadDashboardSearchParams(searchParams);
  return (
    <Suspense fallback={<Skeleton className="size-full" />}>
      <DashboardContent dashboardParams={dashboardParams} />
    </Suspense>
  );
}
