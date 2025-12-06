import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { UsersTable } from "@/components/tables/users/users-table";
import { getUsers } from "@/lib/queries/users";

export default function SettingsUsersPage() {
  const usersPromise = getUsers();

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
          <UsersTable usersPromise={usersPromise} />
        </Suspense>
      </section>
    </>
  );
}
