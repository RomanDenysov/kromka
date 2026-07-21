import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { EditStoreSheet } from "@/components/sheets/edit-store-sheet";
import { renderSection } from "@/features/admin-shell/render-section";
import { getAdminStoreById } from "@/features/stores/api/queries";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function StoresSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return await renderSection({
    domain: "eshop",
    section: "stores",
    searchParams,
  });
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
}: PageProps<"/admin/eshop/stores">) {
  return (
    <>
      <Suspense
        fallback={
          <div className="space-y-3 p-3">
            <div className="h-8" />
            <DataTableSkeleton columnCount={5} rowCount={5} />
          </div>
        }
      >
        <StoresSection searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={null}>
        <StoreSheetLoader searchParams={searchParams} />
      </Suspense>
    </>
  );
}
