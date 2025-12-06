import { type ReactNode, Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetrics } from "../_components/dashboard-metrics";
import { RevenueChartSection } from "../_components/revenue-chart-section";
import { SecondaryMenuSection } from "../_components/secondary-menu-section";
import { TopProductsSection } from "../_components/top-products-section";

type Props = {
  readonly children: ReactNode;
};

export default function AdminDashboardLayout({ children }: Props) {
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Prehľad", href: "/admin" }]} />
      <div className="flex flex-1 flex-col space-y-4 p-4">
        <Suspense fallback={<Skeleton className="size-full" />}>
          <DashboardMetrics />
        </Suspense>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Suspense fallback={<Skeleton className="col-span-4 size-full" />}>
            <RevenueChartSection />
          </Suspense>
          <Suspense fallback={<Skeleton className="col-span-3 size-full" />}>
            <TopProductsSection />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-4">
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

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
