import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardDateChipLoader } from "@/features/daily-view-sidebar/components/dashboard-date-chip-loader";
import { DashboardProfitWidget } from "@/features/reports/components/dashboard-profit-widget";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { AttentionRequiredCard } from "../_components/attention-required-card";
import { DashboardTopMetrics } from "../_components/dashboard-top-metrics";
import { GrowthComparisonCard } from "../_components/growth-comparison-card";
import { RevenueChartSection } from "../_components/revenue-chart-section";
import { RevenueProgressCard } from "../_components/revenue-progress-card";
import { StoreLoadCard } from "../_components/store-load-card";
import { TopProductsSectionWrapper } from "../_components/top-products-section-wrapper";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Prehľad", href: "/admin" }]}>
        <Suspense fallback={null}>
          <DashboardDateChipLoader />
        </Suspense>
      </AdminHeader>
      <div className="grid gap-4">
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

        <div className="grid gap-4 md:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-32" />}>
            <AttentionRequiredCard />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-32" />}>
            <StoreLoadCard />
          </Suspense>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Suspense fallback={<Skeleton className="col-span-4 size-full" />}>
            <RevenueChartSection />
          </Suspense>
          <Suspense fallback={<Skeleton className="col-span-3 size-full" />}>
            <TopProductsSectionWrapper />
          </Suspense>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Suspense fallback={<Skeleton className="h-48" />}>
            <RevenueProgressCard />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-48" />}>
            <GrowthComparisonCard />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-48" />}>
            <DashboardProfitWidget />
          </Suspense>
        </div>
      </div>
    </>
  );
}
