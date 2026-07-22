import { Suspense } from "react";
import { ProductsTable } from "@/components/tables/products/table";
import { getAdminProducts } from "@/features/products/api/queries";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function ProductsLoader() {
  const products = await getAdminProducts();
  return <ProductsTable products={products} />;
}

export default function ProductsPage() {
  return (
    <section className="h-full flex-1">
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <ProductsLoader />
      </Suspense>
    </section>
  );
}
