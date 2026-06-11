import { Suspense } from "react";
import { DashboardDateChipLoader } from "@/features/daily-view-sidebar/components/dashboard-date-chip-loader";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { StoresGrid, StoresGridSkeleton } from "./_components/stores-grid";

export default function EshopPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Prehľad", href: "/admin" },
          { label: "E-shop", href: "/admin/eshop" },
        ]}
      >
        <Suspense fallback={null}>
          <DashboardDateChipLoader />
        </Suspense>
      </AdminHeader>
      <Suspense fallback={<StoresGridSkeleton />}>
        <StoresGrid />
      </Suspense>
    </>
  );
}
