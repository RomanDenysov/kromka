import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { ProductsTable } from "@/components/tables/products/table";
import { getAdminProducts } from "@/lib/queries/products";

async function ProductsLoader() {
  const products = await getAdminProducts();
  return <ProductsTable products={products} />;
}

export default function ProductsPage() {
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
    </>
  );
}
