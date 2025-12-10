import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { StoresTable } from "@/components/tables/stores/table";
import { getAdminStores } from "@/lib/queries/stores";

async function StoresLoader() {
  const stores = await getAdminStores();
  return <StoresTable stores={stores} />;
}

export default function StoresPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody" },
        ]}
      />

      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <StoresLoader />
      </Suspense>
    </>
  );
}
