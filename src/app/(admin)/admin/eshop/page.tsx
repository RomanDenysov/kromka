import { Suspense } from "react";
import { DashboardDateChipLoader } from "@/features/daily-view-sidebar/components/dashboard-date-chip-loader";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { StoresGrid, StoresGridSkeleton } from "./_components/stores-grid";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function EshopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Prehľad", href: "/admin" },
          { label: "E-shop", href: "/admin/eshop" },
        ]}
      >
        <Suspense fallback={null}>
          <DashboardDateChipLoader searchParams={searchParams} />
        </Suspense>
      </AdminHeader>
      <Suspense fallback={<StoresGridSkeleton />}>
        <StoresGrid />
      </Suspense>
    </>
  );
}
