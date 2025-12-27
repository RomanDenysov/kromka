import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { EditStoreSheet } from "@/components/sheets/edit-store-sheet";
import { StoresTable } from "@/components/tables/stores/table";
import { getAdminStoreById, getAdminStores } from "@/lib/queries/stores";

async function StoresLoader() {
  const stores = await getAdminStores();
  return <StoresTable stores={stores} />;
}

async function StoreSheetLoader({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { storeId } = await searchParams;
  const store = await getAdminStoreById(storeId as string);
  if (!store) {
    return null;
  }
  return <EditStoreSheet store={store} />;
}

export default function StoresPage({
  searchParams,
}: PageProps<"/admin/stores">) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody" },
        ]}
      />

      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <StoresLoader />
        </Suspense>
      </section>
      <Suspense fallback={null}>
        <StoreSheetLoader searchParams={searchParams} />
      </Suspense>
    </>
  );
}
