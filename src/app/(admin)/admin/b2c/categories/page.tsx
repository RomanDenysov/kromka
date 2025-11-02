import { Suspense } from "react";
import { AdminHeader } from "@/components/shared/admin-header";
import { CategoriesListing } from "@/features/b2c/category-management/ui/categories-listing";
import { ListingSearch } from "@/features/b2c/category-management/ui/listing-search";
import { ProductsTable } from "@/features/b2c/product-management/ui/products-table";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { CategoriesToolbar } from "./categories-toolbar";

// biome-ignore lint/suspicious/useAwait: <explanation>
export default async function B2CCategoriesPage() {
  // Load all data upfront - filtering happens client-side
  batchPrefetch([
    trpc.admin.categories.list.queryOptions(),
    trpc.admin.products.list.queryOptions(),
  ]);

  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[{ label: "Categories", href: "/admin/b2c/categories" }]}
      >
        <CategoriesToolbar />
      </AdminHeader>
      <div className="relative flex size-full h-[calc(100vh-var(--header-height)-1px)]">
        <div className="sticky top-(--header-height) right-0 left-0 flex w-full max-w-xs shrink-0 flex-col border-r">
          <ListingSearch className="z-10 border-b bg-background" />
          <Suspense fallback={<div>Loading...</div>}>
            <CategoriesListing />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ProductsTable />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
