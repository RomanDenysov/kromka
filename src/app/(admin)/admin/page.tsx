import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import {
  getActiveCarts,
  getDashboardMetrics,
  getRecentOrders,
} from "@/lib/queries/dashboard";
import { DashboardMetrics } from "./_components/dashboard-metrics";
import {
  DashboardMetricsSkeleton,
  RecentOrdersSkeleton,
} from "./_components/dashboard-skeletons";
import { RecentOrders } from "./_components/recent-orders";

async function DashboardMetricsData() {
  const metrics = await getDashboardMetrics();
  return <DashboardMetrics metrics={metrics} />;
}

async function RecentOrdersData() {
  const [orders, carts] = await Promise.all([
    getRecentOrders(),
    getActiveCarts(),
  ]);
  return <RecentOrders carts={carts} orders={orders} />;
}

export default function AdminPage() {
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Prehľad", href: "/admin" }]} />
      <div className="flex flex-1 flex-col">
        <ErrorBoundary fallback={<div>Error loading dashboard metrics</div>}>
          <Suspense fallback={<DashboardMetricsSkeleton />}>
            <DashboardMetricsData />
          </Suspense>
        </ErrorBoundary>

        <div className="grid lg:grid-cols-1">
          <ErrorBoundary fallback={<div>Error loading recent orders</div>}>
            <Suspense fallback={<RecentOrdersSkeleton />}>
              <RecentOrdersData />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
