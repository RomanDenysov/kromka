import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { DashboardMetrics } from "./_components/dashboard-metrics";
import {
  DashboardMetricsSkeleton,
  RecentOrdersSkeleton,
} from "./_components/dashboard-skeletons";
import { RecentOrders } from "./_components/recent-orders";

export default function AdminPage() {
  batchPrefetch([
    trpc.admin.dashboard.metrics.queryOptions(),
    trpc.admin.dashboard.recentOrders.queryOptions(),
    trpc.admin.dashboard.activeCarts.queryOptions(),
  ]);

  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Prehľad", href: "/admin" }]} />
      <div className="flex flex-1 flex-col">
        <HydrateClient>
          <ErrorBoundary fallback={<div>Error loading dashboard metrics</div>}>
            <Suspense fallback={<DashboardMetricsSkeleton />}>
              <DashboardMetrics />
            </Suspense>
          </ErrorBoundary>

          <div className="grid lg:grid-cols-1">
            <ErrorBoundary fallback={<div>Error loading recent orders</div>}>
              <Suspense fallback={<RecentOrdersSkeleton />}>
                <RecentOrders />
              </Suspense>
            </ErrorBoundary>
          </div>
        </HydrateClient>
      </div>
    </>
  );
}
