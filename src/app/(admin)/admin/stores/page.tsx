import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { EditStoreSheet } from "@/components/sheets/edit-store-sheet";
import { StoresTable } from "@/components/tables/stores/table";
import { getAdminStoreById, getAdminStores } from "@/features/stores/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

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
