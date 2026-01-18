import { Suspense } from "react";
import { UsersTable } from "@/components/tables/users/users-table";
import { getUsers } from "@/features/user-management/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
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
