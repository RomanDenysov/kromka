import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { UsersTable } from "@/components/tables/users/users-table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function SettingsUsersPage() {
  prefetch(trpc.admin.users.list.queryOptions());

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Užívatelia", href: "/admin/users" },
        ]}
      />
      <section className="h-full flex-1">
        <HydrateClient>
          <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense
              fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}
            >
              <UsersTable />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </section>
    </>
  );
}
