import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { UsersTable } from "@/components/tables/users/users-table";
import { getUsers } from "@/lib/queries/users";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function UsersLoader() {
  const users = await getUsers();
  return <UsersTable users={users} />;
}

export default function SettingsUsersPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Užívatelia", href: "/admin/users" },
        ]}
      />
      <section className="h-full flex-1">
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <UsersLoader />
        </Suspense>
      </section>
    </>
  );
}
