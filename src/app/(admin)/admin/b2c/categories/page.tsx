import { getCategories } from "@/actions/categories/queries";
import { getProducts, getProductsByCategory } from "@/actions/products/queries";
import { AdminHeader } from "@/components/shared/admin-header";
import { CategoriesListing } from "@/features/b2c/category-management/ui/categories-listing";
import { ProductsTable } from "@/features/b2c/product-management/ui/products-table";

type Props = {
  searchParams: Promise<{
    categoryId?: string;
  }>;
};

export default async function B2CCategoriesPage({ searchParams }: Props) {
  const { categoryId } = await searchParams;
  const categories = await getCategories();
  const products = categoryId
    ? await getProductsByCategory(categoryId)
    : await getProducts();

  return (
    <>
      <AdminHeader
        breadcrumbs={[{ label: "Categories", href: "/admin/b2c/categories" }]}
      />
      <div className="flex size-full">
        <CategoriesListing
          categories={categories}
          selectedCategoryId={categoryId}
        />
        <ProductsTable products={products} />
      </div>
    </>
  );
}
