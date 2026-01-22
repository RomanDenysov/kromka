import { format, getMonth, getYear } from "date-fns";
import { Suspense } from "react";
import { RecentOrdersTable } from "@/components/tables/recent-orders/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMonthlyOrderStats,
  getOrdersByPickupDate,
  getProductsAggregateByPickupDate,
  getRecentOrders,
} from "@/features/admin-dashboard/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { AttentionRequiredCard } from "../_components/attention-required-card";
import { DashboardTopMetrics } from "../_components/dashboard-top-metrics";
import { GrowthComparisonCard } from "../_components/growth-comparison-card";
import { RevenueChartSection } from "../_components/revenue-chart-section";
import { RevenueProgressCard } from "../_components/revenue-progress-card";
import { SecondaryMenuSection } from "../_components/secondary-menu-section";
import { StoreLoadCard } from "../_components/store-load-card";
import { TopProductsSectionWrapper } from "../_components/top-products-section-wrapper";
import { UnusedProductsAlert } from "../_components/unused-products-alert";
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
    <div className="grid grid-cols-1 gap-4 p-4">
      {/* TOP CARDS */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        }
      >
        <DashboardTopMetrics />
      </Suspense>

      {/* MIDDLE ROW: Attention Required + Store Load */}
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-32" />}>
          <AttentionRequiredCard />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-32" />}>
          <StoreLoadCard />
        </Suspense>
      </div>

      {/* EXISTING CONTENT: Calendar + Date Orders/Products */}
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex gap-8">
          <div className="shrink-0">
            <DashboardCalendar dailyStats={dailyStats} />
          </div>
          <div className="grow">
            <DashboardRecentTabs orders={orders} products={products} />
          </div>
        </div>
      </div>

      {/* Revenue Chart + Top Products */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Suspense fallback={<Skeleton className="col-span-4 size-full" />}>
          <RevenueChartSection />
        </Suspense>
        <Suspense fallback={<Skeleton className="col-span-3 size-full" />}>
          <TopProductsSectionWrapper />
        </Suspense>
      </div>

      {/* NEW ANALYTICS ROW */}
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-48" />}>
          <RevenueProgressCard />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-48" />}>
          <GrowthComparisonCard />
        </Suspense>
      </div>

      {/* BOTTOM: Unused Products Alert + Recent Orders */}
      <div className="grid grid-cols-1 gap-4">
        <Suspense fallback={<Skeleton className="h-32" />}>
          <UnusedProductsAlert />
        </Suspense>
        <Suspense
          fallback={
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          }
        >
          <SecondaryMenuSection />
        </Suspense>
        <div className="grow overflow-hidden">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const dashboardParams = loadDashboardSearchParams(searchParams);
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Prehľad", href: "/admin" }]} />
      <Suspense fallback={<Skeleton className="size-full" />}>
        <DashboardContent dashboardParams={dashboardParams} />
      </Suspense>
    </>
  );
}
