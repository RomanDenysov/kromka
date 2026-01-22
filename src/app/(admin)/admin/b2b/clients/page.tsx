import type { Route } from "next";
import { Suspense } from "react";
import { B2BClientsTable } from "@/components/tables/b2b-clients/table";
import { getOrganizations } from "@/features/b2b/clients/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function ClientsLoader() {
  const organizations = await getOrganizations();
  return <B2BClientsTable organizations={organizations} />;
}

export default function B2BClientsPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" as Route },
          { label: "B2B", href: "/admin/b2b" as Route },
          { label: "Klienti", href: "/admin/b2b/clients" as Route },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <ClientsLoader />
        </Suspense>
      </section>
    </>
  );
}
