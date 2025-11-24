import {
  CreditCardIcon,
  PackageIcon,
  ShoppingCartIcon,
  StoreIcon,
} from "lucide-react";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import {
  getActiveCarts,
  getDashboardMetrics,
  getRecentOrders,
} from "@/db/queries/dashboard";
import { formatPrice } from "@/lib/utils";
import { HydrateClient } from "@/trpc/server";
import { MetricCard } from "./_components/metric-card";
import { RecentOrders } from "./_components/recent-orders";

export default function AdminPage() {
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Dashboard", href: "/admin" }]} />
      <div className="flex flex-1 flex-col">
        <Suspense fallback={<div>Loading metrics...</div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </>
  );
}

async function DashboardContent() {
  const [metrics, recentOrders, activeCarts] = await Promise.all([
    getDashboardMetrics(),
    getRecentOrders(),
    getActiveCarts(),
  ]);

  return (
    <HydrateClient>
      <div className="grid gap-0.5 bg-muted p-0.5 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description="For paid orders today"
          icon={CreditCardIcon}
          title="Total Revenue (Today)"
          value={formatPrice(metrics.todaysRevenue)}
        />
        <MetricCard
          description='Orders with status "new"'
          icon={ShoppingCartIcon}
          title="New Orders"
          value={metrics.newOrdersCount}
        />
        <MetricCard
          description="Products currently active"
          icon={PackageIcon}
          title="Active Products"
          value={metrics.activeProductsCount}
        />
        <MetricCard
          description="Stores currently active"
          icon={StoreIcon}
          title="Active Stores"
          value={metrics.activeStoresCount}
        />
      </div>

      <div className="grid lg:grid-cols-1">
        <Suspense>
          <RecentOrders carts={activeCarts} orders={recentOrders} />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
