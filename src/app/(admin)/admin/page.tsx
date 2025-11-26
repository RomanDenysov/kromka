import { Suspense } from "react";
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
    <HydrateClient>
      <AdminHeader breadcrumbs={[{ label: "Prehľad", href: "/admin" }]} />
      <div className="flex flex-1 flex-col">
        <Suspense fallback={<DashboardMetricsSkeleton />}>
          <DashboardMetrics />
        </Suspense>

        <div className="grid lg:grid-cols-1">
          <Suspense fallback={<RecentOrdersSkeleton />}>
            <RecentOrders />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  );
}
