import { Suspense } from "react";
import { DashboardDateChipLoader } from "@/features/daily-view-sidebar/components/dashboard-date-chip-loader";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { StoresGrid, StoresGridSkeleton } from "./_components/stores-grid";

export default function EshopPage() {
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "E-shop", href: "/admin/eshop" }]}>
        <Suspense fallback={null}>
          <DashboardDateChipLoader />
        </Suspense>
      </AdminHeader>
      <div className="p-2">
        <Suspense fallback={<StoresGridSkeleton />}>
          <StoresGrid />
        </Suspense>
      </div>
    </>
  );
}
