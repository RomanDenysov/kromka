import type { Route } from "next";
import { Suspense } from "react";
import { B2BApplicationsTable } from "@/components/tables/b2b-applications/table";
import { getB2bApplications } from "@/features/b2b/applications/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function ApplicationsLoader() {
  const applications = await getB2bApplications();
  return <B2BApplicationsTable applications={applications} />;
}

export default function B2BApplicationsPage({
  searchParams: _searchParams,
}: PageProps<"/admin/b2b/applications">) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" as Route },
          { label: "B2B", href: "/admin/b2b" as Route },
          { label: "Žiadosti", href: "/admin/b2b/applications" as Route },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <ApplicationsLoader />
        </Suspense>
      </section>
    </>
  );
}
