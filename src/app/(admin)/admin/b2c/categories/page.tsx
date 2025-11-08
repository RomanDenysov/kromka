import { Suspense } from "react";
import { DataTable } from "@/components/tables/products/data-table";
import { CategoriesListing } from "@/features/b2c/category-management/ui/categories-listing";
import { ListingSearch } from "@/features/b2c/category-management/ui/listing-search";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export default function B2CCategoriesPage() {
  batchPrefetch([
    trpc.admin.categories.list.queryOptions(),
    trpc.admin.products.list.queryOptions(),
  ]);

  return (
    <HydrateClient>
      <div className="relative flex size-full h-[calc(100vh-var(--header-height)-1px)]">
        <div className="sticky top-(--header-height) right-0 left-0 flex w-full max-w-xs shrink-0 flex-col border-r">
          <ListingSearch className="z-10 border-b bg-background" />
          <Suspense fallback={<div>Loading...</div>}>
            <CategoriesListing />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <DataTable />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
