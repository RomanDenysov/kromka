import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import { SecondaryMenuSection } from "../_components/secondary-menu-section";

export default function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Prehľad", href: "/admin" }]} />

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Suspense fallback={<Skeleton className="col-span-4 size-full" />}>
            <RevenueChartSection />
          </Suspense>
          <Suspense fallback={<Skeleton className="col-span-3 size-full" />}>
            <TopProductsSection />
          </Suspense>
        </div> */}
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
    </>
  );
}
