import { getCategories } from "@/actions/categories/queries";
import { getProducts } from "@/actions/products/queries";
import { AdminHeader } from "@/components/shared/admin-header";
import { CategoriesListing } from "@/features/b2c/category-management/ui/categories-listing";
import { ListingSearch } from "@/features/b2c/category-management/ui/listing-search";
import { ProductsTable } from "@/features/b2c/product-management/ui/products-table";

export default async function B2CCategoriesPage() {
  // Load all data upfront - filtering happens client-side
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <>
      <AdminHeader
        breadcrumbs={[{ label: "Categories", href: "/admin/b2c/categories" }]}
      />
      <div className="relative flex size-full h-[calc(100vh-var(--header-height)-1px)]">
        <div className="sticky top-(--header-height) right-0 left-0 flex w-full max-w-xs shrink-0 flex-col border-r">
          <ListingSearch className="z-10 border-b bg-background" />
          <CategoriesListing categories={categories} />
        </div>
        <ProductsTable products={products} />
      </div>
    </>
  );
}
