import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { StoresTable } from "@/components/tables/stores/table";
import { db } from "@/db";

export default async function StoresPage() {
  const stores = await db.query.stores.findMany({
    with: {
      image: true,
      orders: true,
      users: true,
    },
    orderBy: (store, { asc }) => [asc(store.name)],
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody" },
        ]}
      />

      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <StoresTable stores={stores} />
      </Suspense>
    </>
  );
}
