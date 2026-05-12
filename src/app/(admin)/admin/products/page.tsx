import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { EditProductSheet } from "@/components/sheets/edit-product-sheet";
import { ProductsTable } from "@/components/tables/products/table";
import { getAllergens } from "@/features/allergens/api/queries";
import { getAdminCategories } from "@/features/categories/api/queries";
import {
  getAdminProductById,
  getAdminProducts,
} from "@/features/products/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function ProductsLoader() {
  const products = await getAdminProducts();
  return <ProductsTable products={products} />;
}

async function ProductSheetLoader({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { productId } = await searchParams;
  const [product, categories, allergens] = await Promise.all([
    getAdminProductById(productId as string),
    getAdminCategories(),
    getAllergens(),
  ]);
  if (!product) {
    return null;
  }
  return (
    <EditProductSheet
      allergens={allergens}
      categories={categories}
      product={product}
    />
  );
}

export default function ProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <ProductsLoader />
        </Suspense>
      </section>
      <Suspense fallback={null}>
        <ProductSheetLoader searchParams={searchParams} />
      </Suspense>
    </>
  );
}
