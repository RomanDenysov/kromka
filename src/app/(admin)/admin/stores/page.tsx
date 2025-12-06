import { asc } from "drizzle-orm";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { StoresTable } from "@/components/tables/stores/table";
import { db } from "@/db";
import { stores } from "@/db/schema";

export default function StoresPage() {
  const storesPromise = db.query.stores.findMany({
    with: {
      image: true,
      orders: true,
      users: true,
    },
    orderBy: asc(stores.name),
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
        <StoresTable storesPromise={storesPromise} />
      </Suspense>
    </>
  );
}
