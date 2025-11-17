import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/ui/data-table-skeleton";
import { DataTable } from "@/components/tables/products/data-table";
import { db } from "@/db";

// biome-ignore lint/suspicious/useAwait: <explanation>
export default async function B2CProductsPage() {
  const products = await db.query.products.findMany();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
        ]}
      />

      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <DataTable products={products} />
      </Suspense>
    </>
  );
}
