import { Suspense } from "react";
import { getProducts } from "@/actions/products/queries";
import { AdminHeader } from "@/components/shared/admin-header";
import { ProductsTable } from "@/features/b2c/product-management/ui/products-table";
import { DataTableSkeleton } from "@/widgets/data-table/ui/data-table-skeleton";

export default async function B2CProductsPage() {
  const products = await getProducts();

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log("B2CProductsPage", products);

  return (
    <>
      <AdminHeader
        breadcrumbs={[{ label: "Produkty", href: "/admin/b2c/products" }]}
      />
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <ProductsTable initialData={products} />
      </Suspense>
    </>
  );
}
