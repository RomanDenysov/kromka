import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { renderSection } from "@/features/admin-shell/render-section";
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

export default function StoresPage({
  searchParams,
}: PageProps<"/admin/eshop/stores">) {
  return (
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
  );
}
